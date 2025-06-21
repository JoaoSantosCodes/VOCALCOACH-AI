const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const betaConfig = require('../config/beta.config');

// Configurações
const CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: 'vocalcoach',
  },
  reportPath: path.join(__dirname, '..', 'reports', 'beta', 'progress'),
};

// Função para calcular progresso geral
async function calculateOverallProgress(db) {
  const users = db.collection('users');
  const feedback = db.collection('feedback');
  const metrics = db.collection('beta_metrics');

  const startDate = new Date(betaConfig.beta.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (betaConfig.beta.durationWeeks * 7));
  const now = new Date();
  
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const progressPercentage = Math.min(100, (daysElapsed / totalDays * 100).toFixed(2));

  const [
    totalUsers,
    activeUsers,
    totalFeedback,
    averageMetrics,
  ] = await Promise.all([
    users.countDocuments({ role: 'beta_tester' }),
    users.countDocuments({
      role: 'beta_tester',
      'metrics.lastLogin': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    feedback.countDocuments(),
    metrics.aggregate([
      {
        $group: {
          _id: null,
          avg_error_rate: { $avg: '$performance.error_rate' },
          avg_latency: { $avg: '$performance.avg_latency' },
          avg_engagement: { $avg: { $divide: ['$users.active_today', '$users.total_users'] } },
        },
      },
    ]).toArray(),
  ]);

  return {
    timeline: {
      start_date: startDate.toLocaleDateString('pt-BR'),
      end_date: endDate.toLocaleDateString('pt-BR'),
      days_elapsed,
      days_remaining,
      progress: `${progressPercentage}%`,
    },
    users: {
      total: totalUsers,
      active: activeUsers,
      engagement: `${((activeUsers / totalUsers) * 100).toFixed(2)}%`,
      distribution: await calculateUserDistribution(db),
    },
    feedback: {
      total: totalFeedback,
      by_type: await calculateFeedbackDistribution(db),
      top_issues: await calculateTopIssues(db),
    },
    performance: {
      error_rate: `${(averageMetrics[0]?.avg_error_rate * 100).toFixed(2)}%`,
      avg_latency: `${Math.round(averageMetrics[0]?.avg_latency)}ms`,
      engagement_rate: `${(averageMetrics[0]?.avg_engagement * 100).toFixed(2)}%`,
    },
    features: await calculateFeatureUsage(db),
    milestones: await calculateMilestones(db),
  };
}

// Função para calcular distribuição de usuários
async function calculateUserDistribution(db) {
  const users = db.collection('users');
  const distribution = {};

  for (const group of Object.keys(betaConfig.groups)) {
    distribution[group] = await users.countDocuments({
      role: 'beta_tester',
      betaGroup: group,
    });
  }

  return distribution;
}

// Função para calcular distribuição de feedback
async function calculateFeedbackDistribution(db) {
  const feedback = db.collection('feedback');
  const distribution = await feedback.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  return distribution.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
}

// Função para calcular top issues
async function calculateTopIssues(db) {
  const feedback = db.collection('feedback');
  return feedback.aggregate([
    {
      $match: { type: 'bug' },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 5,
    },
  ]).toArray();
}

// Função para calcular uso de features
async function calculateFeatureUsage(db) {
  const users = db.collection('users');
  const usage = {};

  for (const [feature, config] of Object.entries(betaConfig.features)) {
    if (config.enabled) {
      const metrics = await users.aggregate([
        {
          $match: { role: 'beta_tester' },
        },
        {
          $group: {
            _id: null,
            total_usage: { $sum: `$metrics.${feature}_usage` },
            avg_usage: { $avg: `$metrics.${feature}_usage` },
          },
        },
      ]).toArray();

      usage[feature] = {
        total_usage: metrics[0]?.total_usage || 0,
        avg_usage: (metrics[0]?.avg_usage || 0).toFixed(2),
      };
    }
  }

  return usage;
}

// Função para calcular milestones
async function calculateMilestones(db) {
  const users = db.collection('users');
  const exercises = db.collection('exercises');

  const [
    userMilestones,
    exerciseMilestones,
  ] = await Promise.all([
    users.aggregate([
      {
        $match: { role: 'beta_tester' },
      },
      {
        $group: {
          _id: null,
          total_sessions: { $sum: '$metrics.sessionsCompleted' },
          total_exercises: { $sum: '$metrics.exercisesCompleted' },
          total_feedback: { $sum: '$metrics.feedbackSubmitted' },
        },
      },
    ]).toArray(),
    exercises.aggregate([
      {
        $group: {
          _id: null,
          avg_completion_time: { $avg: '$duration' },
          total_time: { $sum: '$duration' },
        },
      },
    ]).toArray(),
  ]);

  return {
    sessions: userMilestones[0]?.total_sessions || 0,
    exercises: userMilestones[0]?.total_exercises || 0,
    feedback: userMilestones[0]?.total_feedback || 0,
    avg_completion_time: Math.round(exerciseMilestones[0]?.avg_completion_time || 0),
    total_practice_time: Math.round((exerciseMilestones[0]?.total_time || 0) / 60), // em minutos
  };
}

// Função para gerar relatório em markdown
function generateMarkdownReport(progress) {
  return `# Relatório de Progresso do Beta Test - VocalCoach AI
Data: ${new Date().toLocaleDateString('pt-BR')}

## 📅 Timeline

- Data de Início: ${progress.timeline.start_date}
- Data de Término: ${progress.timeline.end_date}
- Dias Decorridos: ${progress.timeline.days_elapsed}
- Dias Restantes: ${progress.timeline.days_remaining}
- Progresso Geral: ${progress.timeline.progress}

## 👥 Usuários

### Visão Geral
- Total de Beta Testers: ${progress.users.total}
- Usuários Ativos (7 dias): ${progress.users.active}
- Taxa de Engajamento: ${progress.users.engagement}

### Distribuição por Grupo
${Object.entries(progress.users.distribution)
  .map(([group, count]) => `- ${group}: ${count} usuários`)
  .join('\n')}

## 💭 Feedback

### Distribuição
- Total: ${progress.feedback.total}
${Object.entries(progress.feedback.by_type)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

### Top 5 Problemas
${progress.feedback.top_issues
  .map(issue => `- ${issue._id}: ${issue.count} reports`)
  .join('\n')}

## 🎯 Performance

- Taxa de Erro Média: ${progress.performance.error_rate}
- Latência Média: ${progress.performance.avg_latency}
- Taxa de Engajamento: ${progress.performance.engagement_rate}

## 🚀 Features

${Object.entries(progress.features)
  .map(([feature, stats]) => `### ${feature}
- Uso Total: ${stats.total_usage}
- Uso Médio por Usuário: ${stats.avg_usage}`)
  .join('\n\n')}

## 🏆 Milestones

- Sessões Completadas: ${progress.milestones.sessions}
- Exercícios Concluídos: ${progress.milestones.exercises}
- Feedbacks Enviados: ${progress.milestones.feedback}
- Tempo Médio de Conclusão: ${progress.milestones.avg_completion_time}s
- Tempo Total de Prática: ${progress.milestones.total_practice_time} minutos

## 📈 Análise

${generateAnalysis(progress)}

## 🎯 Próximos Passos

1. ${generateNextSteps(progress).join('\n2. ')}`;
}

// Função para gerar análise
function generateAnalysis(progress) {
  const analysis = [];

  // Analisar engajamento
  const engagementRate = (progress.users.active / progress.users.total);
  if (engagementRate < 0.5) {
    analysis.push('⚠️ Taxa de engajamento abaixo do esperado. Considerar estratégias de retenção.');
  } else {
    analysis.push('✅ Boa taxa de engajamento dos usuários.');
  }

  // Analisar distribuição
  const maxGroupSize = Math.max(...Object.values(progress.users.distribution));
  const minGroupSize = Math.min(...Object.values(progress.users.distribution));
  if (maxGroupSize / minGroupSize > 2) {
    analysis.push('⚠️ Distribuição desigual entre grupos. Considerar rebalanceamento.');
  }

  // Analisar performance
  const errorRate = parseFloat(progress.performance.error_rate);
  if (errorRate > 5) {
    analysis.push('⚠️ Taxa de erro acima do aceitável. Priorizar correções.');
  }

  // Analisar feedback
  const bugRate = progress.feedback.by_type.bug / progress.feedback.total;
  if (bugRate > 0.3) {
    analysis.push('⚠️ Alta proporção de reports de bugs. Revisar qualidade do código.');
  }

  return analysis.join('\n\n');
}

// Função para gerar próximos passos
function generateNextSteps(progress) {
  const steps = [];

  // Verificar engajamento
  if (progress.users.active / progress.users.total < 0.5) {
    steps.push('Implementar estratégias de reengajamento de usuários inativos');
  }

  // Verificar distribuição
  const distribution = progress.users.distribution;
  const targetDistribution = betaConfig.groups;
  for (const [group, count] of Object.entries(distribution)) {
    if (count < targetDistribution[group].maxUsers * 0.8) {
      steps.push(`Recrutar mais usuários para o grupo ${group}`);
    }
  }

  // Verificar performance
  if (parseFloat(progress.performance.error_rate) > 5) {
    steps.push('Priorizar correção de bugs e otimização de performance');
  }

  // Verificar feedback
  if (progress.feedback.total / progress.users.total < 2) {
    steps.push('Incentivar mais feedback dos usuários');
  }

  // Adicionar passos padrão
  steps.push('Continuar monitoramento e coleta de métricas');
  steps.push('Preparar próxima fase de testes com base no feedback recebido');

  return steps;
}

// Função principal
async function generateBetaProgress() {
  console.log('📊 Gerando relatório de progresso do beta test...\n');

  const client = new MongoClient(CONFIG.mongodb.uri);
  await client.connect();
  const db = client.db(CONFIG.mongodb.dbName);

  try {
    // Calcular progresso
    const progress = await calculateOverallProgress(db);

    // Gerar relatório
    const report = generateMarkdownReport(progress);

    // Criar diretório se não existir
    if (!fs.existsSync(CONFIG.reportPath)) {
      fs.mkdirSync(CONFIG.reportPath, { recursive: true });
    }

    // Salvar relatório
    const reportFile = path.join(
      CONFIG.reportPath,
      `progress-report-${new Date().toISOString().split('T')[0]}.md`
    );
    fs.writeFileSync(reportFile, report);

    console.log('✅ Relatório de progresso gerado com sucesso:', reportFile);

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de progresso:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Executar geração do relatório
generateBetaProgress(); 