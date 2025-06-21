const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: 'config/env/.env' });

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.argv.includes('--db') ? process.argv[process.argv.indexOf('--db') + 1] : process.env.MONGODB_DB;
const BACKUP_PATH = process.env.BACKUP_PATH || 'backups';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '7');
const USE_COMPRESSION = process.env.BACKUP_COMPRESSION === 'true';

// Caminho para o MongoDB Tools
const TOOLS_PATH = path.join(__dirname, '..', 'tools', 'mongodb', 'mongodb-database-tools-windows-x86_64-100.9.4', 'bin');
const MONGODUMP_PATH = path.join(TOOLS_PATH, 'mongodump.exe');

console.log('🚀 Iniciando backup do MongoDB...\n');
console.log('📂 Usando configuração:', path.resolve('config/env/.env'));
console.log('🔄 Retenção:', RETENTION_DAYS, 'dias');
console.log('🗜️ Compressão:', USE_COMPRESSION ? 'Ativada' : 'Desativada');
console.log('\n1️⃣ Executando backup...\n');

try {
    // Criar diretório de backup
    const backupDir = path.join(BACKUP_PATH, `backup-${new Date().toISOString().replace(/:/g, '-')}`);
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

    // Limpar backups antigos
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
            console.log(`🗑️ Removendo backup antigo: ${backup.name}`);
            fs.rmSync(backup.path, { recursive: true, force: true });
        }
    });

    console.log('\n✅ Backup concluído com sucesso!');
    console.log('📂 Local:', backupDir);
} catch (error) {
    console.error('\n❌ Erro durante backup:', error.message);
    process.exit(1);
} 