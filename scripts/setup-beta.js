const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configurações
const CONFIG = {
  requiredEnvVars: [
    'MONGODB_URI',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'DISCORD_BOT_TOKEN',
    'DISCORD_GUILD_ID',
    'DISCORD_INVITE_CHANNEL',
    'DISCORD_ALERT_CHANNEL',
  ],
  directories: [
    'reports/beta',
    'logs/beta',
    'data/beta',
  ],
};

// Função para criar interface de leitura
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Função para perguntar
async function ask(question) {
  const rl = createInterface();
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Função para validar variáveis de ambiente
async function validateEnv() {
  console.log('🔍 Verificando variáveis de ambiente...\n');

  const missingVars = CONFIG.requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('❌ Variáveis de ambiente faltando:');
    console.log(missingVars.join('\n'));

    const shouldConfigure = await ask('\n⚙️ Deseja configurar as variáveis agora? (s/n) ');
    if (shouldConfigure.toLowerCase() !== 's') {
      throw new Error('Configuração cancelada pelo usuário');
    }

    const envFile = path.join(__dirname, '..', '.env');
    let envContent = '';

    for (const varName of missingVars) {
      const value = await ask(`📝 Digite o valor para ${varName}: `);
      envContent += `${varName}=${value}\n`;
    }

    fs.appendFileSync(envFile, envContent);
    console.log('\n✅ Variáveis de ambiente configuradas');
  } else {
    console.log('✅ Todas as variáveis de ambiente estão configuradas');
  }
}

// Função para criar diretórios necessários
function createDirectories() {
  console.log('\n📁 Criando diretórios necessários...');

  for (const dir of CONFIG.directories) {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Diretório criado: ${dir}`);
    } else {
      console.log(`ℹ️ Diretório já existe: ${dir}`);
    }
  }
}

// Função para verificar dependências
async function checkDependencies() {
  console.log('\n📦 Verificando dependências...');

  try {
    await execAsync('npm list discord.js mongodb nodemailer node-cron');
    console.log('✅ Todas as dependências estão instaladas');
  } catch (error) {
    console.log('❌ Algumas dependências estão faltando');
    
    const shouldInstall = await ask('\n⚙️ Deseja instalar as dependências faltantes? (s/n) ');
    if (shouldInstall.toLowerCase() !== 's') {
      throw new Error('Instalação cancelada pelo usuário');
    }

    console.log('\n📥 Instalando dependências...');
    await execAsync('npm install discord.js mongodb nodemailer node-cron');
    console.log('✅ Dependências instaladas com sucesso');
  }
}

// Função para configurar scripts
async function configureScripts() {
  console.log('\n⚙️ Configurando scripts...');

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = require(packageJsonPath);

  const scripts = {
    'beta:send-invites': 'node scripts/send-beta-invites.js',
    'beta:send-invites:ci': 'cross-env CI=true npm run beta:send-invites',
    'beta:monitor': 'node scripts/monitor-beta.js',
    'beta:monitor:ci': 'cross-env CI=true npm run beta:monitor',
    'beta:report': 'node scripts/generate-beta-report.js',
    'beta:report:ci': 'cross-env CI=true npm run beta:report',
    'beta:report:daily': 'node scripts/generate-beta-report.js --daily',
    'beta:report:weekly': 'node scripts/generate-beta-report.js --weekly',
    'beta:schedule-reports': 'node scripts/schedule-beta-reports.js',
    'beta:schedule-reports:ci': 'cross-env CI=true npm run beta:schedule-reports',
  };

  let updated = false;
  for (const [name, command] of Object.entries(scripts)) {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = command;
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Scripts configurados com sucesso');
  } else {
    console.log('ℹ️ Scripts já estão configurados');
  }
}

// Função para configurar MongoDB
async function configureMongoDB() {
  console.log('\n🗄️ Configurando MongoDB...');

  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    // Criar índices
    const db = client.db('vocalcoach');
    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('users').createIndex({ role: 1 }),
      db.collection('users').createIndex({ betaGroup: 1 }),
      db.collection('feedback').createIndex({ type: 1 }),
      db.collection('feedback').createIndex({ createdAt: 1 }),
      db.collection('performance_metrics').createIndex({ timestamp: 1 }),
      db.collection('performance_metrics').createIndex({ type: 1 }),
      db.collection('beta_metrics').createIndex({ timestamp: 1 }),
    ]);

    await client.close();
    console.log('✅ MongoDB configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar MongoDB:', error);
    throw error;
  }
}

// Função para configurar Discord
async function configureDiscord() {
  console.log('\n🎮 Verificando configuração do Discord...');

  try {
    const { Client, Intents } = require('discord.js');
    const client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });

    await client.login(process.env.DISCORD_BOT_TOKEN);
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    
    // Verificar canais
    const channels = await guild.channels.fetch();
    const requiredChannels = ['beta-general', 'beta-bugs', 'beta-feedback', 'beta-announcements'];
    
    for (const channelName of requiredChannels) {
      if (!channels.some(c => c.name === channelName)) {
        console.log(`❌ Canal ${channelName} não encontrado`);
        const shouldCreate = await ask(`⚙️ Deseja criar o canal ${channelName}? (s/n) `);
        if (shouldCreate.toLowerCase() === 's') {
          await guild.channels.create(channelName, {
            type: 'text',
            topic: `Canal para ${channelName.replace('beta-', '')} do beta test`,
          });
          console.log(`✅ Canal ${channelName} criado`);
        }
      }
    }

    await client.destroy();
    console.log('✅ Discord configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar Discord:', error);
    throw error;
  }
}

// Função principal
async function setupBeta() {
  console.log('🚀 Iniciando configuração do ambiente beta...\n');

  try {
    await validateEnv();
    createDirectories();
    await checkDependencies();
    await configureScripts();
    await configureMongoDB();
    await configureDiscord();

    console.log('\n🎉 Configuração concluída com sucesso!\n');
    console.log('Próximos passos:');
    console.log('1. Revisar as configurações no arquivo .env');
    console.log('2. Iniciar o monitoramento com: npm run beta:monitor');
    console.log('3. Agendar relatórios com: npm run beta:schedule-reports');
    console.log('4. Enviar convites com: npm run beta:send-invites');

  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar setup
setupBeta(); 