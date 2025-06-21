const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const discordAlerts = require('./discord-alerts');
const { verifyBackup } = require('./verify-backup');
require('dotenv').config({ path: 'config/env/.env' });

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.argv.includes('--db') ? process.argv[process.argv.indexOf('--db') + 1] : process.env.MONGODB_DB;
const BACKUP_PATH = process.env.BACKUP_PATH || 'backups';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '7');
const USE_COMPRESSION = process.env.BACKUP_COMPRESSION === 'true';

// Configurações S3
const S3_BUCKET = process.env.BACKUP_S3_BUCKET;
const S3_PREFIX = process.env.BACKUP_S3_PREFIX || 'mongodb-backups/';
const USE_S3 = process.env.USE_S3_BACKUP === 'true' && S3_BUCKET;

// Inicializar cliente S3
const s3Client = USE_S3 ? new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}) : null;

// Caminho para o MongoDB Tools
const TOOLS_PATH = path.join(__dirname, '..', 'tools', 'mongodb', 'mongodb-database-tools-windows-x86_64-100.9.4', 'bin');
const MONGODUMP_PATH = path.join(TOOLS_PATH, 'mongodump.exe');

async function getBackupSize(backupDir) {
    let totalSize = 0;
    const files = await fs.promises.readdir(backupDir, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(backupDir, file.name);
        if (file.isDirectory()) {
            totalSize += await getBackupSize(filePath);
        } else {
            const stats = await fs.promises.stat(filePath);
            totalSize += stats.size;
        }
    }
    
    return totalSize;
}

function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

async function uploadToS3(localPath, fileName) {
    if (!USE_S3) return;
    
    console.log('\n2️⃣ Fazendo upload para S3...');
    try {
        const fileStream = fs.createReadStream(localPath);
        const uploadParams = {
            Bucket: S3_BUCKET,
            Key: `${S3_PREFIX}${fileName}`,
            Body: fileStream
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log('📤 Upload concluído:', fileName);
        return `s3://${S3_BUCKET}/${S3_PREFIX}${fileName}`;
    } catch (error) {
        console.error('❌ Erro no upload para S3:', error.message);
        await discordAlerts.sendBackupWarning('Falha no upload para S3', {
            localPath,
            error: error.message
        });
        throw error;
    }
}

async function cleanupS3Backups() {
    if (!USE_S3) return;

    console.log('\n3️⃣ Limpando backups antigos no S3...');
    try {
        const listParams = {
            Bucket: S3_BUCKET,
            Prefix: S3_PREFIX
        };

        const response = await s3Client.send(new ListObjectsV2Command(listParams));
        if (!response.Contents) return;

        const backups = response.Contents
            .filter(obj => obj.Key.startsWith(S3_PREFIX))
            .map(obj => ({
                key: obj.Key,
                date: obj.LastModified
            }))
            .sort((a, b) => b.date - a.date);

        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - RETENTION_DAYS);

        for (const backup of backups) {
            if (backup.date < retentionDate) {
                console.log(`🗑️ Removendo backup antigo do S3: ${backup.key}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: backup.key
                }));
            }
        }
    } catch (error) {
        console.error('❌ Erro na limpeza do S3:', error.message);
        await discordAlerts.sendBackupWarning('Falha na limpeza de backups antigos do S3', {
            error: error.message
        });
        throw error;
    }
}

async function main() {
    console.log('🚀 Iniciando backup do MongoDB...\n');
    console.log('📂 Usando configuração:', path.resolve('config/env/.env'));
    console.log('🔄 Retenção:', RETENTION_DAYS, 'dias');
    console.log('🗜️ Compressão:', USE_COMPRESSION ? 'Ativada' : 'Desativada');
    console.log('☁️ Backup S3:', USE_S3 ? 'Ativado' : 'Desativado');
    if (USE_S3) {
        console.log('🪣 Bucket:', S3_BUCKET);
        console.log('📁 Prefix:', S3_PREFIX);
    }
    console.log('\n1️⃣ Executando backup local...\n');

    const startTime = Date.now();
    let backupDir;
    let s3Path;

    try {
        // Criar diretório de backup
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        backupDir = path.join(BACKUP_PATH, `backup-${timestamp}`);
        fs.mkdirSync(backupDir, { recursive: true });

        // Comando de backup
        const command = [
            `"${MONGODUMP_PATH}"`,
            `--uri="${MONGODB_URI}"`,
            `--db=${MONGODB_DB}`,
            `--out="${backupDir}"`,
            USE_COMPRESSION ? '--gzip' : ''
        ].filter(Boolean).join(' ');

        // Executar backup
        execSync(command, { stdio: 'inherit' });

        // Upload para S3 se configurado
        if (USE_S3) {
            s3Path = await uploadToS3(backupDir, `backup-${timestamp}`);
        }

        // Limpar backups antigos locais
        const backups = fs.readdirSync(BACKUP_PATH)
            .filter(dir => dir.startsWith('backup-'))
            .map(dir => ({
                name: dir,
                path: path.join(BACKUP_PATH, dir),
                date: new Date(dir.replace('backup-', ''))
            }))
            .sort((a, b) => b.date - a.date);

        // Manter apenas os backups dentro do período de retenção
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - RETENTION_DAYS);

        backups.forEach((backup, index) => {
            if (index >= RETENTION_DAYS || backup.date < retentionDate) {
                console.log(`🗑️ Removendo backup local antigo: ${backup.name}`);
                fs.rmSync(backup.path, { recursive: true, force: true });
            }
        });

        // Limpar backups antigos no S3
        if (USE_S3) {
            await cleanupS3Backups();
        }

        // Calcular estatísticas
        const backupSize = await getBackupSize(backupDir);
        const duration = Date.now() - startTime;
        const collections = fs.readdirSync(path.join(backupDir, MONGODB_DB))
            .filter(file => file.endsWith('.bson'))
            .map(file => file.replace('.bson', ''));

        // Enviar alerta de sucesso
        await discordAlerts.sendBackupSuccess({
            localPath: backupDir,
            size: formatSize(backupSize),
            duration: formatDuration(duration),
            collections,
            s3Path
        });

        console.log('\n✅ Backup concluído com sucesso!');
        console.log('📂 Local:', backupDir);
        console.log('📦 Tamanho:', formatSize(backupSize));
        console.log('⏱️ Duração:', formatDuration(duration));
        if (USE_S3) {
            console.log('☁️ S3:', s3Path);
        }

        // Verificar integridade do backup
        console.log('\n🔍 Iniciando verificação do backup...');
        await verifyBackup(backupDir);

    } catch (error) {
        console.error('\n❌ Erro durante backup:', error.message);
        await discordAlerts.sendBackupFailed(error, {
            localPath: backupDir,
            duration: formatDuration(Date.now() - startTime)
        });
        process.exit(1);
    }
}

main().catch(async error => {
    console.error('\n❌ Erro não tratado:', error);
    await discordAlerts.sendBackupFailed(error);
    process.exit(1);
}); 