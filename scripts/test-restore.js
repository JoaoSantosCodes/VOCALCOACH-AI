const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const discordAlerts = require('./discord-alerts');
require('dotenv').config({ path: 'config/env/.env' });

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const SOURCE_DB = process.env.MONGODB_DB || 'vocalcoach_staging';
const TEST_DB = process.env.TEST_RESTORE_DB || 'vocalcoach_test_restore';
const BACKUP_PATH = process.env.BACKUP_PATH || 'backups';
const USE_COMPRESSION = process.env.BACKUP_COMPRESSION === 'true';

// Configurações S3
const S3_BUCKET = process.env.BACKUP_S3_BUCKET;
const S3_PREFIX = process.env.BACKUP_S3_PREFIX || 'mongodb-backups/';
const USE_S3 = process.env.USE_S3_BACKUP === 'true' && S3_BUCKET;

// Caminho para o MongoDB Tools
const TOOLS_PATH = path.join(__dirname, '..', 'tools', 'mongodb', 'mongodb-database-tools-windows-x86_64-100.9.4', 'bin');
const MONGORESTORE_PATH = path.join(TOOLS_PATH, 'mongorestore.exe');

// Inicializar cliente S3
const s3Client = USE_S3 ? new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}) : null;

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

async function downloadFromS3(backupName) {
    if (!USE_S3) return null;

    console.log('\n1️⃣ Baixando backup do S3...');
    try {
        const key = `${S3_PREFIX}${backupName}`;
        console.log('📥 Baixando:', key);

        const response = await s3Client.send(new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: key
        }));

        const localPath = path.join(BACKUP_PATH, 'restore-test', backupName);
        fs.mkdirSync(path.dirname(localPath), { recursive: true });

        const writeStream = fs.createWriteStream(localPath);
        await new Promise((resolve, reject) => {
            response.Body.pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        console.log('✅ Download concluído:', localPath);
        return localPath;
    } catch (error) {
        console.error('❌ Erro ao baixar do S3:', error.message);
        await discordAlerts.sendRestoreFailed(error, {
            sourcePath: `s3://${S3_BUCKET}/${key}`,
            database: TEST_DB
        });
        throw error;
    }
}

async function getLatestBackup() {
    if (USE_S3) {
        // Usar backup mais recente do S3
        const listParams = {
            Bucket: S3_BUCKET,
            Prefix: S3_PREFIX
        };

        const response = await s3Client.send(new ListObjectsV2Command(listParams));
        if (!response.Contents || response.Contents.length === 0) {
            throw new Error('Nenhum backup encontrado no S3');
        }

        const latestBackup = response.Contents
            .filter(obj => obj.Key.startsWith(S3_PREFIX))
            .sort((a, b) => b.LastModified - a.LastModified)[0];

        return latestBackup.Key.replace(S3_PREFIX, '');
    } else {
        // Usar backup mais recente local
        const backups = fs.readdirSync(BACKUP_PATH)
            .filter(dir => dir.startsWith('backup-'))
            .map(dir => ({
                name: dir,
                date: new Date(dir.replace('backup-', ''))
            }))
            .sort((a, b) => b.date - a.date);

        if (backups.length === 0) {
            throw new Error('Nenhum backup local encontrado');
        }

        return backups[0].name;
    }
}

async function testRestore() {
    console.log('🔄 Iniciando teste de restauração...\n');
    const startTime = Date.now();
    
    try {
        // Obter backup mais recente
        const latestBackup = await getLatestBackup();
        console.log('📦 Backup mais recente:', latestBackup);

        // Se usando S3, baixar primeiro
        let backupPath;
        if (USE_S3) {
            backupPath = await downloadFromS3(latestBackup);
        } else {
            backupPath = path.join(BACKUP_PATH, latestBackup);
        }

        console.log('\n2️⃣ Iniciando restauração para banco de teste...');
        
        // Comando de restauração
        const command = [
            `"${MONGORESTORE_PATH}"`,
            `--uri="${MONGODB_URI}"`,
            `--db=${TEST_DB}`,
            `--nsFrom="${SOURCE_DB}.*"`,
            `--nsTo="${TEST_DB}.*"`,
            USE_COMPRESSION ? '--gzip' : '',
            `"${backupPath}/${SOURCE_DB}/"`,
            '--drop' // Limpa o banco de teste antes da restauração
        ].filter(Boolean).join(' ');

        // Executar restauração
        execSync(command, { stdio: 'inherit' });

        console.log('\n3️⃣ Verificando restauração...');
        
        // Verificar se as coleções foram restauradas
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(TEST_DB);
        const collections = await db.listCollections().toArray();
        const collectionStats = [];
        let totalDocuments = 0;
        
        console.log('\n📊 Coleções restauradas:');
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            totalDocuments += count;
            console.log(`- ${collection.name}: ${count} documentos`);
            collectionStats.push(`${collection.name} (${count})`);
        }

        await client.close();

        // Limpar arquivos temporários se baixados do S3
        if (USE_S3 && backupPath) {
            console.log('\n🧹 Limpando arquivos temporários...');
            fs.rmSync(path.dirname(backupPath), { recursive: true, force: true });
        }

        // Enviar alerta de sucesso
        await discordAlerts.sendRestoreSuccess({
            sourcePath: USE_S3 ? `s3://${S3_BUCKET}/${S3_PREFIX}${latestBackup}` : backupPath,
            database: TEST_DB,
            duration: formatDuration(Date.now() - startTime),
            collections: collectionStats,
            totalDocuments
        });

        console.log('\n✅ Teste de restauração concluído com sucesso!');
    } catch (error) {
        console.error('\n❌ Erro durante teste de restauração:', error.message);
        await discordAlerts.sendRestoreFailed(error, {
            sourcePath: backupPath,
            database: TEST_DB,
            duration: formatDuration(Date.now() - startTime)
        });
        process.exit(1);
    }
}

testRestore().catch(async error => {
    console.error('\n❌ Erro não tratado:', error);
    await discordAlerts.sendRestoreFailed(error, {
        database: TEST_DB
    });
    process.exit(1);
}); 