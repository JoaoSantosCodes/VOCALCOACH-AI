module.exports = {
  // Configurações gerais do beta
  beta: {
    startDate: '2024-03-20',
    durationWeeks: 6,
    maxUsers: 100,
    supportEmail: 'beta@vocalcoach.ai',
    supportPhone: '+XX XX XXXX-XXXX',
  },

  // Grupos de beta testers
  groups: {
    beginner: {
      maxUsers: 40,
      features: ['basic_exercises', 'offline_mode'],
      description: 'Usuários iniciantes, foco em funcionalidades básicas',
    },
    intermediate: {
      maxUsers: 40,
      features: ['voice_analysis', 'gamification'],
      description: 'Usuários intermediários, foco em análise de voz',
    },
    advanced: {
      maxUsers: 20,
      features: ['all'],
      description: 'Usuários avançados, acesso a todas as features',
    },
  },

  // Features disponíveis no beta
  features: {
    basic_exercises: {
      enabled: true,
      description: 'Exercícios básicos de aquecimento e técnica',
      metrics: ['completion_rate', 'time_spent', 'progress'],
    },
    voice_analysis: {
      enabled: true,
      description: 'Análise detalhada da voz com feedback em tempo real',
      metrics: ['accuracy', 'pitch_detection', 'timing'],
    },
    gamification: {
      enabled: true,
      description: 'Sistema de pontos, conquistas e rankings',
      metrics: ['engagement', 'retention', 'social_interaction'],
    },
    offline_mode: {
      enabled: true,
      description: 'Acesso offline a exercícios e progresso',
      metrics: ['sync_success', 'offline_usage', 'data_integrity'],
    },
    social_features: {
      enabled: false,
      description: 'Recursos sociais e compartilhamento',
      metrics: ['connections', 'shares', 'comments'],
    },
  },

  // Métricas a serem coletadas
  metrics: {
    user: {
      login_frequency: 'daily',
      session_duration: 'per_session',
      feature_usage: 'per_feature',
      progress_tracking: 'weekly',
    },
    performance: {
      latency: 'per_request',
      error_rate: 'hourly',
      resource_usage: 'daily',
    },
    feedback: {
      bug_reports: 'per_occurrence',
      feature_requests: 'per_user',
      satisfaction: 'weekly',
    },
  },

  // Thresholds para alertas
  thresholds: {
    error_rate: {
      warning: 0.01, // 1%
      critical: 0.05, // 5%
    },
    latency: {
      warning: 500, // 500ms
      critical: 1000, // 1s
    },
    crash_rate: {
      warning: 0.001, // 0.1%
      critical: 0.01, // 1%
    },
  },

  // Configurações de monitoramento
  monitoring: {
    metrics_interval: 60000, // 1 minuto
    alert_channels: ['email', 'discord', 'slack'],
    log_retention: '30d',
  },

  // Configurações de feedback
  feedback: {
    forms: {
      bug_report: {
        required_fields: ['description', 'steps', 'expected', 'actual'],
        attachments: ['screenshots', 'logs'],
      },
      feature_request: {
        required_fields: ['title', 'description', 'use_case'],
        optional_fields: ['priority', 'alternatives'],
      },
      satisfaction_survey: {
        frequency: 'weekly',
        questions: ['ease_of_use', 'feature_satisfaction', 'recommendations'],
      },
    },
    channels: {
      discord: {
        channels: {
          general: 'beta-general',
          bugs: 'beta-bugs',
          feedback: 'beta-feedback',
          announcements: 'beta-announcements',
        },
      },
      email: {
        templates: {
          welcome: 'BETA_INVITE_EMAIL',
          feedback: 'FEEDBACK_REQUEST',
          survey: 'SATISFACTION_SURVEY',
        },
      },
    },
  },

  // Configurações de recompensas
  rewards: {
    points: {
      bug_report: 10,
      feature_request: 5,
      survey_completion: 15,
      daily_login: 1,
      exercise_completion: 2,
    },
    tiers: {
      bronze: {
        min_points: 0,
        rewards: ['1_month_premium'],
      },
      silver: {
        min_points: 100,
        rewards: ['3_months_premium', 'early_access'],
      },
      gold: {
        min_points: 300,
        rewards: ['6_months_premium', 'early_access', 'badge'],
      },
      platinum: {
        min_points: 1000,
        rewards: ['12_months_premium', 'early_access', 'badge', 'special_mention'],
      },
    },
  },

  // Configurações de suporte
  support: {
    priority_levels: {
      low: {
        response_time: '24h',
        resolution_time: '72h',
      },
      medium: {
        response_time: '12h',
        resolution_time: '48h',
      },
      high: {
        response_time: '4h',
        resolution_time: '24h',
      },
      critical: {
        response_time: '1h',
        resolution_time: '4h',
      },
    },
    channels: {
      email: 'beta@vocalcoach.ai',
      discord: '@VocalCoachSupport',
      phone: '+XX XX XXXX-XXXX',
    },
    hours: {
      weekday: '9:00-18:00',
      weekend: '10:00-16:00',
      timezone: 'America/Sao_Paulo',
    },
  },
}; 