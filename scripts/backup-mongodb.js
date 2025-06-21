const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const BACKUP_RETENTION_DAYS = 7;
const COLLECTIONS = [
    'users',
    'achievements',
    'blogposts',
    'feedback',
    'stats',
    'userprogress',
    'vocalexercises',
    'voiceanalysis'
];

async function createBackupDirectory() {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        console.log('✅ Diretório de backup criado:', BACKUP_DIR);
    } catch (error) {
        console.error('❌ Erro ao criar diretório de backup:', error);
        process.exit(1);
    }
}

async function cleanOldBackups() {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        const now = new Date();

        for (const file of files) {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = await fs.stat(filePath);
            const daysOld = (now - stats.mtime) / (1000 * 60 * 60 * 24);

            if (daysOld > BACKUP_RETENTION_DAYS) {
                await fs.unlink(filePath);
                console.log(`🗑️ Backup antigo removido: ${file}`);
            }
        }
    } catch (error) {
        console.error('⚠️ Erro ao limpar backups antigos:', error);
    }
}

async function backupMongoDB() {
    console.log('🚀 Iniciando backup do MongoDB...\n');

    // Verificar variáveis de ambiente
    const requiredEnvVars = ['MONGODB_URI', 'MONGODB_DB'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
        process.exit(1);
    }

    // Criar diretório de backup
    await createBackupDirectory();

    // Limpar backups antigos
    await cleanOldBackups();

    // Gerar nome do arquivo de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}`);

    try {
        // Backup de cada coleção
        for (const collection of COLLECTIONS) {
            const outputFile = `${backupFile}-${collection}.gz`;
            const command = `mongodump --uri="${process.env.MONGODB_URI}" --db=${process.env.MONGODB_DB} --collection=${collection} --gzip --archive="${outputFile}"`;

            console.log(`📦 Fazendo backup da coleção: ${collection}`);
            await new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ Erro no backup de ${collection}:`, stderr);
                        reject(error);
                    } else {
                        console.log(`✅ Backup de ${collection} concluído`);
                        resolve(stdout);
                    }
                });
            });
        }

        // Criar arquivo de metadados
        const metadata = {
            timestamp: new Date().toISOString(),
            collections: COLLECTIONS,
            mongodb_version: process.env.MONGODB_VERSION || 'unknown',
            backup_files: COLLECTIONS.map(col => `backup-${timestamp}-${col}.gz`)
        };

        await fs.writeFile(
            `${backupFile}-metadata.json`,
            JSON.stringify(metadata, null, 2)
        );

        console.log('\n🎉 Backup concluído com sucesso!');
        console.log('📂 Arquivos salvos em:', BACKUP_DIR);
        console.log('📊 Total de coleções:', COLLECTIONS.length);
        console.log('🕒 Timestamp:', timestamp);

    } catch (error) {
        console.error('\n❌ Erro durante o backup:', error);
        process.exit(1);
    }
}

// Executar backup
backupMongoDB().catch(console.error); 