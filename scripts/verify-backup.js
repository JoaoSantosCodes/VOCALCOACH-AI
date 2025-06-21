const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const discordAlerts = require('./discord-alerts');
const crypto = require('crypto');
require('dotenv').config({ path: 'config/env/.env' });

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const SOURCE_DB = process.env.MONGODB_DB || 'vocalcoach_staging';
const VERIFY_DB = 'vocalcoach_verify';
const BACKUP_PATH = process.env.BACKUP_PATH || 'backups';
const USE_COMPRESSION = process.env.BACKUP_COMPRESSION === 'true';

// Configurações S3
const S3_BUCKET = process.env.BACKUP_S3_BUCKET;
const S3_PREFIX = process.env.BACKUP_S3_PREFIX || 'mongodb-backups/';
const USE_S3 = process.env.USE_S3_BACKUP === 'true' && S3_BUCKET;

// Caminho para o MongoDB Tools
const TOOLS_PATH = path.join(__dirname, '..', 'tools', 'mongodb', 'mongodb-database-tools-windows-x86_64-100.9.4', 'bin');
const MONGORESTORE_PATH = path.join(TOOLS_PATH, 'mongorestore.exe');
const MONGODUMP_PATH = path.join(TOOLS_PATH, 'mongodump.exe');

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

async function calculateHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

async function verifyBackupFiles(backupPath) {
    console.log('\n1️⃣ Verificando integridade dos arquivos...');
    const issues = [];
    const hashes = {};

    try {
        const dbPath = path.join(backupPath, SOURCE_DB);
        const files = fs.readdirSync(dbPath);

        for (const file of files) {
            const filePath = path.join(dbPath, file);
            const stats = fs.statSync(filePath);

            // Verificar tamanho
            if (stats.size === 0) {
                issues.push(`Arquivo vazio: ${file}`);
                continue;
            }

            // Verificar permissões
            const mode = stats.mode.toString(8);
            if (!mode.endsWith('644') && !mode.endsWith('444')) {
                issues.push(`Permissões incorretas em ${file}: ${mode}`);
            }

            // Calcular hash
            const hash = await calculateHash(filePath);
            hashes[file] = hash;

            // Verificar pares .bson e .metadata.json
            if (file.endsWith('.bson')) {
                const metadataFile = file.replace('.bson', '.metadata.json');
                if (!files.includes(metadataFile)) {
                    issues.push(`Arquivo de metadados ausente: ${metadataFile}`);
                }
            }
        }

        return { issues, hashes };
    } catch (error) {
        throw new Error(`Erro ao verificar arquivos: ${error.message}`);
    }
}

async function verifyDataIntegrity(backupPath) {
    console.log('\n2️⃣ Verificando integridade dos dados...');
    const issues = [];

    try {
        // Restaurar para banco de verificação
        const command = [
            `"${MONGORESTORE_PATH}"`,
            `--uri="${MONGODB_URI}"`,
            `--db=${VERIFY_DB}`,
            `--nsFrom="${SOURCE_DB}.*"`,
            `--nsTo="${VERIFY_DB}.*"`,
            USE_COMPRESSION ? '--gzip' : '',
            `"${backupPath}/${SOURCE_DB}/"`,
            '--drop'
        ].filter(Boolean).join(' ');

        execSync(command, { stdio: 'inherit' });

        // Conectar aos bancos
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const sourceDb = client.db(SOURCE_DB);
        const verifyDb = client.db(VERIFY_DB);

        // Comparar coleções
        const sourceCols = await sourceDb.listCollections().toArray();
        const verifyCols = await verifyDb.listCollections().toArray();

        if (sourceCols.length !== verifyCols.length) {
            issues.push(`Número diferente de coleções: ${sourceCols.length} (origem) vs ${verifyCols.length} (backup)`);
        }

        // Verificar cada coleção
        for (const sourceCol of sourceCols) {
            const colName = sourceCol.name;
            console.log(`\nVerificando coleção: ${colName}`);

            const sourceCollection = sourceDb.collection(colName);
            const verifyCollection = verifyDb.collection(colName);

            // Comparar contagem
            const sourceCount = await sourceCollection.countDocuments();
            const verifyCount = await verifyCollection.countDocuments();

            if (sourceCount !== verifyCount) {
                issues.push(`Contagem diferente em ${colName}: ${sourceCount} (origem) vs ${verifyCount} (backup)`);
                continue;
            }

            // Comparar índices
            const sourceIndexes = await sourceCollection.indexes();
            const verifyIndexes = await verifyCollection.indexes();

            if (sourceIndexes.length !== verifyIndexes.length) {
                issues.push(`Número diferente de índices em ${colName}`);
            }

            // Verificar documentos
            const sourceDocs = await sourceCollection.find().sort({ _id: 1 }).toArray();
            const verifyDocs = await verifyCollection.find().sort({ _id: 1 }).toArray();

            for (let i = 0; i < sourceDocs.length; i++) {
                if (JSON.stringify(sourceDocs[i]) !== JSON.stringify(verifyDocs[i])) {
                    issues.push(`Diferença encontrada no documento ${i} da coleção ${colName}`);
                    break;
                }
            }
        }

        await client.close();
        return issues;
    } catch (error) {
        throw new Error(`Erro ao verificar integridade dos dados: ${error.message}`);
    }
}

async function verifyBackup(backupPath) {
    console.log('🔍 Iniciando verificação do backup...');
    console.log('📂 Backup:', backupPath);
    const startTime = Date.now();
    const results = {
        backupPath,
        startTime: new Date().toISOString(),
        fileIssues: [],
        dataIssues: [],
        hashes: {},
        success: false,
        duration: 0
    };

    try {
        // Verificar existência do backup
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup não encontrado: ${backupPath}`);
        }

        // Verificar arquivos
        const fileCheck = await verifyBackupFiles(backupPath);
        results.fileIssues = fileCheck.issues;
        results.hashes = fileCheck.hashes;

        // Verificar dados
        const dataIssues = await verifyDataIntegrity(backupPath);
        results.dataIssues = dataIssues;

        // Atualizar resultados
        results.success = results.fileIssues.length === 0 && results.dataIssues.length === 0;
        results.duration = Date.now() - startTime;

        // Enviar alerta
        if (results.success) {
            await discordAlerts.sendBackupSuccess({
                localPath: backupPath,
                verificationStatus: 'Passou em todas as verificações',
                duration: formatDuration(results.duration),
                hashes: Object.keys(results.hashes).length
            });
        } else {
            const issues = [
                ...results.fileIssues.map(issue => `📁 ${issue}`),
                ...results.dataIssues.map(issue => `🔍 ${issue}`)
            ];

            await discordAlerts.sendBackupWarning(
                'Problemas encontrados na verificação do backup',
                {
                    localPath: backupPath,
                    duration: formatDuration(results.duration),
                    issues: issues.join('\n')
                }
            );
        }

        // Salvar relatório
        const reportPath = path.join(backupPath, 'verify-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

        console.log('\n✅ Verificação concluída!');
        console.log('📊 Resultado:', results.success ? 'Sucesso' : 'Falhas encontradas');
        console.log('⏱️ Duração:', formatDuration(results.duration));
        console.log('📝 Relatório:', reportPath);

        if (!results.success) {
            console.log('\n⚠️ Problemas encontrados:');
            [...results.fileIssues, ...results.dataIssues].forEach(issue => {
                console.log(`- ${issue}`);
            });
        }

        return results;
    } catch (error) {
        console.error('\n❌ Erro durante verificação:', error.message);
        await discordAlerts.sendBackupFailed(error, {
            localPath: backupPath,
            stage: 'verificação',
            duration: formatDuration(Date.now() - startTime)
        });
        throw error;
    } finally {
        // Limpar banco de verificação
        try {
            const client = new MongoClient(MONGODB_URI);
            await client.connect();
            await client.db(VERIFY_DB).dropDatabase();
            await client.close();
        } catch (error) {
            console.error('Erro ao limpar banco de verificação:', error.message);
        }
    }
}

// Função principal
async function main() {
    try {
        // Encontrar backup mais recente
        const backups = fs.readdirSync(BACKUP_PATH)
            .filter(dir => dir.startsWith('backup-'))
            .map(dir => ({
                name: dir,
                path: path.join(BACKUP_PATH, dir),
                date: new Date(dir.replace('backup-', ''))
            }))
            .sort((a, b) => b.date - a.date);

        if (backups.length === 0) {
            throw new Error('Nenhum backup encontrado');
        }

        const latestBackup = backups[0];
        await verifyBackup(latestBackup.path);
    } catch (error) {
        console.error('\n❌ Erro não tratado:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        console.error('\n❌ Erro fatal:', error.message);
        process.exit(1);
    });
}

module.exports = { verifyBackup }; 