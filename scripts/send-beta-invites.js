const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const Discord = require('discord.js');
const betaConfig = require('../config/beta.config');
const betaTesters = require('../config/beta-testers.json');

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

// Função para ler template de email
function getEmailTemplate() {
  const templatePath = path.join(__dirname, '..', 'docs', 'templates', 'BETA_INVITE_EMAIL.md');
  return fs.readFileSync(templatePath, 'utf8');
}

// Função para personalizar email
function customizeEmail(template, data) {
  return template
    .replace('{{name}}', data.name)
    .replace('{{group}}', data.group)
    .replace('{{tempPassword}}', data.tempPassword)
    .replace('{{discordInvite}}', data.discordInvite)
    .replace('{{startDate}}', data.startDate)
    .replace('{{supportUrl}}', data.supportUrl)
    .replace('{{supportPhone}}', data.supportPhone);
}

// Função para gerar convite do Discord
async function generateDiscordInvite(client, channelId) {
  const channel = await client.channels.fetch(channelId);
  return channel.createInvite({
    maxAge: 604800, // 7 dias
    maxUses: 1,
    unique: true,
  });
}

// Função para enviar convites para um grupo específico
async function sendGroupInvites(group, testers, transporter, discordClient, db) {
  console.log(`\n📧 Enviando convites para grupo ${group}...`);
  
  for (const tester of testers) {
    try {
      console.log(`\nProcessando ${tester.email}...`);

      // Gerar senha temporária
      const tempPassword = generateTempPassword();

      // Gerar convite do Discord
      const discordInvite = await generateDiscordInvite(
        discordClient,
        CONFIG.discord.inviteChannel
      );

      // Dados para o email
      const emailData = {
        ...tester,
        tempPassword,
        discordInvite: discordInvite.url,
        startDate: new Date().toLocaleDateString('pt-BR'),
        supportUrl: 'https://support.vocalcoach.ai',
        supportPhone: betaConfig.beta.supportPhone,
      };

      // Personalizar e enviar email
      const emailTemplate = getEmailTemplate();
      const emailContent = customizeEmail(emailTemplate, emailData);

      await transporter.sendMail({
        from: '"VocalCoach AI" <beta@vocalcoach.ai>',
        to: tester.email,
        subject: 'Bem-vindo ao Beta Test do VocalCoach AI! 🎵',
        text: emailContent,
      });

      // Criar usuário no banco
      await db.collection('users').insertOne({
        email: tester.email,
        name: tester.name || tester.email.split('@')[0],
        password: tempPassword,
        role: 'beta_tester',
        status: 'invited',
        invitedAt: new Date(),
        discordInvite: discordInvite.url,
        betaGroup: group,
        features: tester.features,
        metrics: {
          lastLogin: null,
          sessionsCompleted: 0,
          exercisesCompleted: 0,
          feedbackSubmitted: 0,
          bugsReported: 0,
        },
      });

      console.log(`✅ Convite enviado para ${tester.email}`);

    } catch (error) {
      console.error(`❌ Erro ao processar ${tester.email}:`, error);
    }
  }
}

// Função principal para enviar convites
async function sendBetaInvites() {
  console.log('🚀 Iniciando envio de convites...\n');

  // Conectar ao MongoDB
  const mongoClient = new MongoClient(CONFIG.mongodb.uri);
  await mongoClient.connect();
  const db = mongoClient.db(CONFIG.mongodb.dbName);

  // Conectar ao Discord
  const discordClient = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS],
  });
  await discordClient.login(CONFIG.discord.token);

  // Configurar email
  const transporter = nodemailer.createTransport(CONFIG.smtp);

  try {
    // Processar cada grupo
    for (const [group, testers] of Object.entries(betaTesters.beta_testers)) {
      await sendGroupInvites(group, testers, transporter, discordClient, db);
    }

    // Atualizar status
    const now = new Date();
    betaTesters.status.last_updated = now.toISOString();
    fs.writeFileSync(
      path.join(__dirname, '..', 'config', 'beta-testers.json'),
      JSON.stringify(betaTesters, null, 2)
    );

    console.log('\n🎉 Processo de envio de convites concluído!');
    console.log(`📊 Total de convites enviados: ${betaTesters.status.total_users}`);
    console.log('\nPróximos passos:');
    console.log('1. Monitorar aceitação dos convites');
    console.log('2. Verificar entrada nos canais do Discord');
    console.log('3. Iniciar coleta de métricas');

  } catch (error) {
    console.error('\n❌ Erro durante o processo:', error);
  } finally {
    // Fechar conexões
    await mongoClient.close();
    await discordClient.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  sendBetaInvites().catch(console.error);
} 