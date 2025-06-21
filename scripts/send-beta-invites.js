const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const Discord = require('discord.js');

// Configurações
const CONFIG = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: 'vocalcoach',
  },
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    inviteChannel: process.env.DISCORD_INVITE_CHANNEL,
  },
};

// Função para gerar senha temporária
function generateTempPassword() {
  return crypto.randomBytes(8).toString('hex');
}

// Função para gerar link do Discord
async function generateDiscordInvite(client, channelId) {
  const channel = await client.channels.fetch(channelId);
  return channel.createInvite({
    maxAge: 604800, // 7 dias
    maxUses: 1,
    unique: true,
  });
}

// Função para ler template do email
function getEmailTemplate() {
  const templatePath = path.join(__dirname, '..', 'docs', 'templates', 'BETA_INVITE_EMAIL.md');
  return fs.readFileSync(templatePath, 'utf8');
}

// Função para personalizar o email
function customizeEmail(template, data) {
  return template
    .replace('[Nome do Beta Tester]', data.name)
    .replace('[Data de Início]', data.startDate)
    .replace('[Email do Beta Tester]', data.email)
    .replace('[Senha Gerada]', data.tempPassword)
    .replace('[Link do Convite]', data.discordInvite)
    .replace('[Link do Portal de Suporte]', data.supportUrl)
    .replace('[Número do Suporte]', data.supportPhone);
}

// Função principal para enviar convites
async function sendBetaInvites(betaTesters) {
  console.log('🚀 Iniciando envio de convites...\n');

  // Conectar ao MongoDB
  const mongoClient = new MongoClient(CONFIG.mongodb.uri);
  await mongoClient.connect();
  const db = mongoClient.db(CONFIG.mongodb.dbName);
  const usersCollection = db.collection('users');

  // Conectar ao Discord
  const discordClient = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS],
  });
  await discordClient.login(CONFIG.discord.token);

  // Configurar email
  const transporter = nodemailer.createTransport(CONFIG.smtp);

  // Ler template
  const emailTemplate = getEmailTemplate();

  // Processar cada beta tester
  for (const tester of betaTesters) {
    console.log(`📧 Processando convite para ${tester.name}...`);

    try {
      // Gerar senha temporária
      const tempPassword = generateTempPassword();

      // Gerar convite do Discord
      const discordInvite = await generateDiscordInvite(
        discordClient,
        CONFIG.discord.inviteChannel
      );

      // Dados para personalização do email
      const emailData = {
        ...tester,
        tempPassword,
        discordInvite: discordInvite.url,
        startDate: new Date().toLocaleDateString('pt-BR'),
        supportUrl: 'https://support.vocalcoach.ai',
        supportPhone: '+XX XX XXXX-XXXX',
      };

      // Personalizar email
      const emailContent = customizeEmail(emailTemplate, emailData);

      // Enviar email
      await transporter.sendMail({
        from: '"VocalCoach AI" <beta@vocalcoach.ai>',
        to: tester.email,
        subject: 'Bem-vindo ao Beta Test do VocalCoach AI! 🎵',
        text: emailContent,
      });

      // Criar usuário no banco
      await usersCollection.insertOne({
        email: tester.email,
        name: tester.name,
        password: tempPassword, // Será alterada no primeiro login
        role: 'beta_tester',
        status: 'invited',
        invitedAt: new Date(),
        discordInvite: discordInvite.url,
        betaGroup: tester.group || 'general',
        features: tester.features || ['all'],
        metrics: {
          lastLogin: null,
          sessionsCompleted: 0,
          exercisesCompleted: 0,
          feedbackSubmitted: 0,
          bugsReported: 0,
        },
      });

      console.log(`✅ Convite enviado para ${tester.email}\n`);

    } catch (error) {
      console.error(`❌ Erro ao processar ${tester.email}:`, error);
    }
  }

  // Fechar conexões
  await mongoClient.close();
  await discordClient.destroy();

  console.log('\n🎉 Processo de envio de convites concluído!');
}

// Lista de beta testers (exemplo)
const betaTesters = [
  {
    name: 'João Silva',
    email: 'joao@example.com',
    group: 'advanced',
    features: ['voice_analysis', 'gamification'],
  },
  {
    name: 'Maria Santos',
    email: 'maria@example.com',
    group: 'beginner',
    features: ['basic_exercises', 'offline_mode'],
  },
  // Adicionar mais beta testers aqui
];

// Executar script
sendBetaInvites(betaTesters).catch(error => {
  console.error('❌ Erro durante envio de convites:', error);
  process.exit(1);
}); 