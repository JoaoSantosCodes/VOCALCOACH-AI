const { MongoClient } = require('mongodb');
const { exec } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const execPromise = util.promisify(exec);

// Carregar configuração baseada no ambiente
const envFile = process.argv.includes('--staging') ? 'staging.env' : '.env';
dotenv.config({ path: path.join(__dirname, '..', 'config', 'env', envFile) });

// Configurações
const BACKUP_PATH = process.env.BACKUP_PATH || './backups';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);
const USE_COMPRESSION = process.env.BACKUP_COMPRESSION === 'true';

async function createBackup() {
    console.log('🚀 Iniciando backup do MongoDB...\n');
    console.log('📂 Usando configuração:', path.join(__dirname, '..', 'config', 'env', envFile));
    console.log('💾 Diretório de backup:', BACKUP_PATH);
    console.log('🔄 Retenção:', RETENTION_DAYS, 'dias');
    console.log('🗜️ Compressão:', USE_COMPRESSION ? 'Ativada' : 'Desativada');

    try {
        // Criar diretório de backup se não existir
        await fs.mkdir(BACKUP_PATH, { recursive: true });

        // Nome do arquivo de backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(BACKUP_PATH, `backup-${timestamp}`);

        // Comando de backup
        const mongodump = [
            'mongodump',
            `--uri="${process.env.MONGODB_URI}"`,
            `--db=${process.env.MONGODB_DB}`,
            `--out="${backupFile}"`,
            USE_COMPRESSION ? '--gzip' : ''
        ].filter(Boolean).join(' ');

        console.log('\n1️⃣ Executando backup...');
        await execPromise(mongodump);
        console.log('✅ Backup concluído');

        // Limpar backups antigos
        console.log('\n2️⃣ Limpando backups antigos...');
        const files = await fs.readdir(BACKUP_PATH);
        const now = new Date();

        for (const file of files) {
            const filePath = path.join(BACKUP_PATH, file);
            const stats = await fs.stat(filePath);
            const daysOld = (now - stats.mtime) / (1000 * 60 * 60 * 24);

            if (daysOld > RETENTION_DAYS) {
                await fs.rm(filePath, { recursive: true });
                console.log(`🗑️ Removido backup antigo: ${file}`);
            }
        }

        // Criar arquivo de metadados do backup
        const metadata = {
            timestamp: new Date().toISOString(),
            database: process.env.MONGODB_DB,
            backup_file: backupFile,
            compression: USE_COMPRESSION,
            retention_days: RETENTION_DAYS
        };

        await fs.writeFile(
            path.join(backupFile, 'backup-metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        console.log('\n🎉 Backup concluído com sucesso!');
        console.log('\n📝 Detalhes do backup:');
        console.log('- Arquivo:', backupFile);
        console.log('- Banco:', process.env.MONGODB_DB);
        console.log('- Data:', new Date().toLocaleString());

        console.log('\nPróximos passos:');
        console.log('1. Verifique os arquivos de backup');
        console.log('2. Execute: npm run beta:test-restore');
        console.log('3. Valide a integridade dos dados');

    } catch (error) {
        console.error('\n❌ Erro durante backup:', error);
        process.exit(1);
    }
}

// Executar backup
createBackup().catch(console.error); 