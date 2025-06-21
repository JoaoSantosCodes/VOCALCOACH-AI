const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const betaConfig = require('../config/beta.config');

// Configurações
const CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: 'vocalcoach',
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
  reportPath: path.join(__dirname, '..', 'reports', 'beta'),
};

// Função para calcular estatísticas de usuários
async function calculateUserStats(db, startDate, endDate) {
  const users = db.collection('users');
  const metrics = db.collection('beta_metrics');

  const stats = {
    total_users: await users.countDocuments({ role: 'beta_tester' }),
    by_group: {},
    engagement: {
      daily_active: [],
      weekly_active: [],
      retention: {},
    },
    progress: {
      exercises_completed: {},
      feedback_submitted: {},
    },
  };

  // Estatísticas por grupo
  for (const group of Object.keys(betaConfig.groups)) {
    stats.by_group[group] = await users.countDocuments({
      role: 'beta_tester',
      betaGroup: group,
    });
  }

  // Engajamento diário e semanal
  const dailyMetrics = await metrics
    .find({
      timestamp: { $gte: startDate, $lte: endDate },
    })
    .sort({ timestamp: 1 })
    .toArray();

  dailyMetrics.forEach(metric => {
    stats.engagement.daily_active.push({
      date: metric.timestamp,
      count: metric.users.active_today,
    });
    stats.engagement.weekly_active.push({
      date: metric.timestamp,
      count: metric.users.active_week,
    });
  });

  // Retenção (por semana desde o início)
  const weeksSinceStart = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
  for (let week = 1; week <= weeksSinceStart; week++) {
    const weekStart = new Date(startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const activeUsers = await users.countDocuments({
      role: 'beta_tester',
      'metrics.lastLogin': { $gte: weekStart, $lt: weekEnd },
    });

    stats.engagement.retention[`week_${week}`] = {
      active_users: activeUsers,
      retention_rate: (activeUsers / stats.total_users * 100).toFixed(2) + '%',
    };
  }

  // Progresso dos usuários
  const userProgress = await users.aggregate([
    { $match: { role: 'beta_tester' } },
    {
      $group: {
        _id: null,
        total_exercises: { $sum: '$metrics.exercisesCompleted' },
        total_feedback: { $sum: '$metrics.feedbackSubmitted' },
      },
    },
  ]).toArray();

  if (userProgress.length > 0) {
    const avgExercises = userProgress[0].total_exercises / stats.total_users;
    const avgFeedback = userProgress[0].total_feedback / stats.total_users;

    stats.progress = {
      total_exercises: userProgress[0].total_exercises,
      avg_exercises_per_user: avgExercises.toFixed(2),
      total_feedback: userProgress[0].total_feedback,
      avg_feedback_per_user: avgFeedback.toFixed(2),
    };
  }

  return stats;
}

// Função para calcular estatísticas de feedback
async function calculateFeedbackStats(db, startDate, endDate) {
  const feedback = db.collection('feedback');

  return {
    total: await feedback.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    }),
    by_type: {
      bugs: await feedback.countDocuments({
        type: 'bug',
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      features: await feedback.countDocuments({
        type: 'feature',
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      general: await feedback.countDocuments({
        type: 'general',
        createdAt: { $gte: startDate, $lte: endDate },
      }),
    },
    top_issues: await feedback.aggregate([
      {
        $match: {
          type: 'bug',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]).toArray(),
    top_requests: await feedback.aggregate([
      {
        $match: {
          type: 'feature',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]).toArray(),
  };
}

// Função para calcular estatísticas de performance
async function calculatePerformanceStats(db, startDate, endDate) {
  const metrics = db.collection('performance_metrics');

  const [error_stats, latency_stats] = await Promise.all([
    metrics.aggregate([
      {
        $match: {
          type: 'error',
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          avg_rate: { $avg: '$value' },
          max_rate: { $max: '$value' },
          min_rate: { $min: '$value' },
        },
      },
    ]).toArray(),
    metrics.aggregate([
      {
        $match: {
          type: 'latency',
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          avg_latency: { $avg: '$value' },
          max_latency: { $max: '$value' },
          min_latency: { $min: '$value' },
          p95_latency: { $percentile: { input: '$value', p: 0.95 } },
        },
      },
    ]).toArray(),
  ]);

  return {
    error_rate: {
      average: (error_stats[0]?.avg_rate * 100).toFixed(2) + '%',
      maximum: (error_stats[0]?.max_rate * 100).toFixed(2) + '%',
      minimum: (error_stats[0]?.min_rate * 100).toFixed(2) + '%',
    },
    latency: {
      average: Math.round(latency_stats[0]?.avg_latency || 0) + 'ms',
      maximum: Math.round(latency_stats[0]?.max_latency || 0) + 'ms',
      minimum: Math.round(latency_stats[0]?.min_latency || 0) + 'ms',
      p95: Math.round(latency_stats[0]?.p95_latency || 0) + 'ms',
    },
  };
}

// Função para gerar relatório em markdown
function generateMarkdownReport(stats) {
  return `# Relatório do Beta Test - VocalCoach AI
Data: ${new Date().toLocaleDateString('pt-BR')}

## 📊 Estatísticas de Usuários

### Visão Geral
- Total de Beta Testers: ${stats.users.total_users}
- Exercícios Completados: ${stats.users.progress.total_exercises}
- Média de Exercícios por Usuário: ${stats.users.progress.avg_exercises_per_user}
- Feedback Enviado: ${stats.users.progress.total_feedback}
- Média de Feedback por Usuário: ${stats.users.progress.avg_feedback_per_user}

### Por Grupo
${Object.entries(stats.users.by_group)
  .map(([group, count]) => `- ${group}: ${count} usuários`)
  .join('\n')}

### Retenção
${Object.entries(stats.users.engagement.retention)
  .map(([week, data]) => `- ${week}: ${data.retention_rate} (${data.active_users} usuários)`)
  .join('\n')}

## 💭 Feedback

### Distribuição
- Total: ${stats.feedback.total}
- Bugs: ${stats.feedback.by_type.bugs}
- Sugestões: ${stats.feedback.by_type.features}
- Geral: ${stats.feedback.by_type.general}

### Top 5 Problemas Reportados
${stats.feedback.top_issues
  .map(issue => `- ${issue._id}: ${issue.count} reports`)
  .join('\n')}

### Top 5 Sugestões
${stats.feedback.top_requests
  .map(request => `- ${request._id}: ${request.count} requests`)
  .join('\n')}

## 🎯 Performance

### Taxa de Erro
- Média: ${stats.performance.error_rate.average}
- Máxima: ${stats.performance.error_rate.maximum}
- Mínima: ${stats.performance.error_rate.minimum}

### Latência
- Média: ${stats.performance.latency.average}
- P95: ${stats.performance.latency.p95}
- Máxima: ${stats.performance.latency.maximum}
- Mínima: ${stats.performance.latency.minimum}

## 📈 Próximos Passos

1. Priorizar a resolução dos principais problemas reportados
2. Avaliar as sugestões mais solicitadas para possível implementação
3. Otimizar áreas com maior latência
4. Focar em aumentar a retenção de usuários
5. Implementar melhorias baseadas no feedback recebido

## 🎉 Conclusão

O beta test está progredindo conforme planejado, com engajamento significativo dos usuários e feedback valioso sendo coletado. As métricas de performance estão dentro dos limites aceitáveis, com algumas áreas identificadas para otimização.`;
}

// Função principal para gerar relatório
async function generateBetaReport() {
  console.log('📊 Gerando relatório do beta test...\n');

  const client = new MongoClient(CONFIG.mongodb.uri);
  await client.connect();
  const db = client.db(CONFIG.mongodb.dbName);

  try {
    // Definir período do relatório
    const endDate = new Date();
    const startDate = new Date(betaConfig.beta.startDate);

    // Coletar estatísticas
    const stats = {
      users: await calculateUserStats(db, startDate, endDate),
      feedback: await calculateFeedbackStats(db, startDate, endDate),
      performance: await calculatePerformanceStats(db, startDate, endDate),
    };

    // Gerar relatório em markdown
    const report = generateMarkdownReport(stats);

    // Criar diretório de relatórios se não existir
    if (!fs.existsSync(CONFIG.reportPath)) {
      fs.mkdirSync(CONFIG.reportPath, { recursive: true });
    }

    // Salvar relatório
    const reportFile = path.join(
      CONFIG.reportPath,
      `beta-report-${new Date().toISOString().split('T')[0]}.md`
    );
    fs.writeFileSync(reportFile, report);

    // Enviar por email
    const transporter = nodemailer.createTransport(CONFIG.smtp);
    await transporter.sendMail({
      from: '"VocalCoach AI Reports" <reports@vocalcoach.ai>',
      to: betaConfig.beta.supportEmail,
      subject: `📊 Relatório do Beta Test - ${new Date().toLocaleDateString('pt-BR')}`,
      text: report,
      attachments: [
        {
          filename: path.basename(reportFile),
          path: reportFile,
        },
      ],
    });

    console.log('✅ Relatório gerado com sucesso:', reportFile);

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Executar geração do relatório
generateBetaReport(); 