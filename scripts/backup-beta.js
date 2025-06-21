const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configurações
const CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: 'vocalcoach',
    collections: [
      'users',
      'feedback',
      'performance_metrics',
      'beta_metrics',
      'exercises',
    ],
  },
  backup: {
    path: path.join(__dirname, '..', 'data', 'beta', 'backups'),
    retention: 7, // dias
  },
};

// Função para criar diretório de backup
function createBackupDir() {
  const date = new Date().toISOString().split('T')[0];
  const backupDir = path.join(CONFIG.backup.path, date);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  return backupDir;
}

// Função para fazer backup do MongoDB
async function backupMongoDB(backupDir) {
  console.log('📦 Iniciando backup do MongoDB...');

  const client = new MongoClient(CONFIG.mongodb.uri);
  await client.connect();
  const db = client.db(CONFIG.mongodb.dbName);

  for (const collection of CONFIG.mongodb.collections) {
    console.log(`📄 Exportando collection: ${collection}`);
    
    const data = await db.collection(collection).find({}).toArray();
    const filePath = path.join(backupDir, `${collection}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  await client.close();
  console.log('✅ Backup do MongoDB concluído');
}

// Função para fazer backup dos arquivos
async function backupFiles(backupDir) {
  console.log('📁 Iniciando backup dos arquivos...');

  const dirsToBackup = [
    'reports/beta',
    'logs/beta',
  ];

  for (const dir of dirsToBackup) {
    const sourcePath = path.join(__dirname, '..', dir);
    const targetPath = path.join(backupDir, dir);

    if (fs.existsSync(sourcePath)) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      await execAsync(`cp -r "${sourcePath}" "${targetPath}"`);
    }
  }

  console.log('✅ Backup dos arquivos concluído');
}

// Função para compactar backup
async function compressBackup(backupDir) {
  console.log('🗜️ Compactando backup...');

  const date = path.basename(backupDir);
  const targetFile = `${backupDir}.tar.gz`;

  await execAsync(`tar -czf "${targetFile}" -C "${path.dirname(backupDir)}" "${date}"`);
  await execAsync(`rm -rf "${backupDir}"`);

  console.log('✅ Backup compactado com sucesso');
  return targetFile;
}

// Função para limpar backups antigos
function cleanOldBackups() {
  console.log('🧹 Limpando backups antigos...');

  const files = fs.readdirSync(CONFIG.backup.path)
    .filter(file => file.endsWith('.tar.gz'))
    .map(file => ({
      name: file,
      path: path.join(CONFIG.backup.path, file),
      date: new Date(file.split('.')[0]),
    }))
    .sort((a, b) => b.date - a.date);

  // Manter apenas os backups dentro do período de retenção
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - CONFIG.backup.retention);

  for (const file of files) {
    if (file.date < retentionDate) {
      fs.unlinkSync(file.path);
      console.log(`🗑️ Backup removido: ${file.name}`);
    }
  }

  console.log('✅ Limpeza concluída');
}

// Função para calcular tamanho do backup
function getBackupSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  const mb = (bytes / 1024 / 1024).toFixed(2);
  return `${mb} MB`;
}

// Função principal
async function backupBeta() {
  console.log('🚀 Iniciando processo de backup...\n');

  try {
    // Criar diretório de backup
    const backupDir = createBackupDir();

    // Fazer backups
    await backupMongoDB(backupDir);
    await backupFiles(backupDir);

    // Compactar
    const backupFile = await compressBackup(backupDir);
    const backupSize = getBackupSize(backupFile);

    // Limpar backups antigos
    cleanOldBackups();

    console.log('\n✨ Backup concluído com sucesso!');
    console.log(`📦 Arquivo: ${path.basename(backupFile)}`);
    console.log(`📊 Tamanho: ${backupSize}`);
    console.log(`📅 Data: ${new Date().toLocaleString()}`);

  } catch (error) {
    console.error('\n❌ Erro durante o backup:', error);
    process.exit(1);
  }
}

// Executar backup
backupBeta(); 