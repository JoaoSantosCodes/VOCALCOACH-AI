const { MongoClient } = require('mongodb');
const Discord = require('discord.js');
const nodemailer = require('nodemailer');
const betaConfig = require('../config/beta.config');

// Configurações
const CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: 'vocalcoach',
  },
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    alertChannel: process.env.DISCORD_ALERT_CHANNEL,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
};

// Função para calcular métricas de usuário
async function calculateUserMetrics(db) {
  const users = db.collection('users');
  const now = new Date();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const metrics = {
    total_users: await users.countDocuments({ role: 'beta_tester' }),
    active_today: await users.countDocuments({
      role: 'beta_tester',
      'metrics.lastLogin': { $gte: dayAgo },
    }),
    active_week: await users.countDocuments({
      role: 'beta_tester',
      'metrics.lastLogin': { $gte: weekAgo },
    }),
    by_group: {},
  };

  // Métricas por grupo
  for (const group of Object.keys(betaConfig.groups)) {
    metrics.by_group[group] = await users.countDocuments({
      role: 'beta_tester',
      betaGroup: group,
    });
  }

  return metrics;
}

// Função para calcular métricas de exercícios
async function calculateExerciseMetrics(db) {
  const exercises = db.collection('exercises');
  const now = new Date();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);

  return {
    total_exercises: await exercises.countDocuments(),
    completed_today: await exercises.countDocuments({
      completedAt: { $gte: dayAgo },
    }),
    avg_completion_time: await exercises.aggregate([
      {
        $match: {
          completedAt: { $gte: dayAgo },
        },
      },
      {
        $group: {
          _id: null,
          avg_time: { $avg: '$duration' },
        },
      },
    ]).toArray(),
  };
}

// Função para calcular métricas de feedback
async function calculateFeedbackMetrics(db) {
  const feedback = db.collection('feedback');
  const now = new Date();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);

  return {
    total_feedback: await feedback.countDocuments(),
    feedback_today: await feedback.countDocuments({
      createdAt: { $gte: dayAgo },
    }),
    by_type: {
      bug_reports: await feedback.countDocuments({ type: 'bug' }),
      feature_requests: await feedback.countDocuments({ type: 'feature' }),
      general: await feedback.countDocuments({ type: 'general' }),
    },
  };
}

// Função para calcular métricas de performance
async function calculatePerformanceMetrics(db) {
  const metrics = db.collection('performance_metrics');
  const now = new Date();
  const hourAgo = new Date(now - 60 * 60 * 1000);

  const [error_rate, avg_latency] = await Promise.all([
    metrics.aggregate([
      {
        $match: {
          timestamp: { $gte: hourAgo },
          type: 'error',
        },
      },
      {
        $group: {
          _id: null,
          rate: {
            $avg: '$value',
          },
        },
      },
    ]).toArray(),
    metrics.aggregate([
      {
        $match: {
          timestamp: { $gte: hourAgo },
          type: 'latency',
        },
      },
      {
        $group: {
          _id: null,
          avg: {
            $avg: '$value',
          },
        },
      },
    ]).toArray(),
  ]);

  return {
    error_rate: error_rate[0]?.rate || 0,
    avg_latency: avg_latency[0]?.avg || 0,
  };
}

// Função para verificar alertas
function checkAlerts(metrics) {
  const alerts = [];

  // Verificar error rate
  if (metrics.performance.error_rate >= betaConfig.thresholds.error_rate.critical) {
    alerts.push({
      level: 'CRITICAL',
      message: `Error rate (${(metrics.performance.error_rate * 100).toFixed(2)}%) above critical threshold!`,
    });
  } else if (metrics.performance.error_rate >= betaConfig.thresholds.error_rate.warning) {
    alerts.push({
      level: 'WARNING',
      message: `Error rate (${(metrics.performance.error_rate * 100).toFixed(2)}%) above warning threshold.`,
    });
  }

  // Verificar latência
  if (metrics.performance.avg_latency >= betaConfig.thresholds.latency.critical) {
    alerts.push({
      level: 'CRITICAL',
      message: `Average latency (${metrics.performance.avg_latency.toFixed(0)}ms) above critical threshold!`,
    });
  } else if (metrics.performance.avg_latency >= betaConfig.thresholds.latency.warning) {
    alerts.push({
      level: 'WARNING',
      message: `Average latency (${metrics.performance.avg_latency.toFixed(0)}ms) above warning threshold.`,
    });
  }

  // Verificar engajamento
  const engagementRate = metrics.users.active_today / metrics.users.total_users;
  if (engagementRate < 0.1) { // menos de 10% de usuários ativos
    alerts.push({
      level: 'WARNING',
      message: `Low daily engagement rate (${(engagementRate * 100).toFixed(2)}%).`,
    });
  }

  return alerts;
}

// Função para enviar alertas
async function sendAlerts(alerts) {
  if (alerts.length === 0) return;

  // Preparar mensagem
  const message = alerts
    .map(alert => `[${alert.level}] ${alert.message}`)
    .join('\n');

  // Enviar para Discord
  const discordClient = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS],
  });
  await discordClient.login(CONFIG.discord.token);
  const channel = await discordClient.channels.fetch(CONFIG.discord.alertChannel);
  await channel.send({
    embeds: [{
      title: '🚨 Beta Test Alerts',
      description: message,
      color: alerts.some(a => a.level === 'CRITICAL') ? 0xFF0000 : 0xFFAA00,
      timestamp: new Date(),
    }],
  });
  await discordClient.destroy();

  // Enviar por email
  const transporter = nodemailer.createTransport(CONFIG.smtp);
  await transporter.sendMail({
    from: '"VocalCoach AI Monitoring" <monitoring@vocalcoach.ai>',
    to: betaConfig.beta.supportEmail,
    subject: `🚨 Beta Test Alerts - ${alerts.length} issue(s)`,
    text: message,
  });
}

// Função principal de monitoramento
async function monitorBeta() {
  console.log('📊 Iniciando monitoramento do beta...\n');

  const client = new MongoClient(CONFIG.mongodb.uri);
  await client.connect();
  const db = client.db(CONFIG.mongodb.dbName);

  try {
    // Coletar métricas
    const metrics = {
      users: await calculateUserMetrics(db),
      exercises: await calculateExerciseMetrics(db),
      feedback: await calculateFeedbackMetrics(db),
      performance: await calculatePerformanceMetrics(db),
      timestamp: new Date(),
    };

    // Salvar métricas
    await db.collection('beta_metrics').insertOne(metrics);

    // Verificar e enviar alertas
    const alerts = checkAlerts(metrics);
    if (alerts.length > 0) {
      await sendAlerts(alerts);
      console.log('⚠️ Alertas enviados:', alerts.length);
    }

    // Log de sucesso
    console.log('✅ Métricas coletadas com sucesso:', {
      users: metrics.users.total_users,
      active_today: metrics.users.active_today,
      exercises_today: metrics.exercises.completed_today,
      feedback_today: metrics.feedback.feedback_today,
      error_rate: `${(metrics.performance.error_rate * 100).toFixed(2)}%`,
      avg_latency: `${metrics.performance.avg_latency.toFixed(0)}ms`,
    });

  } catch (error) {
    console.error('❌ Erro durante monitoramento:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Executar monitoramento
const INTERVAL = betaConfig.monitoring.metrics_interval;
console.log(`🔄 Monitoramento configurado para rodar a cada ${INTERVAL / 1000} segundos`);

setInterval(monitorBeta, INTERVAL);
monitorBeta(); // Primeira execução imediata 