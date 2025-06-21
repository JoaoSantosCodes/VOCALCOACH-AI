// Exemplo de configuração de monitoramento
export const monitoringConfig = {
  // Sentry
  sentry: {
    dsn: 'https://your-sentry-dsn.ingest.sentry.io/project-id',
    tracesSampleRate: 0.1,
    environment: 'beta',
  },

  // Mixpanel
  mixpanel: {
    token: 'your-mixpanel-token',
    debug: true,
    track_pageview: true,
    persistence: 'localStorage',
  },

  // Hotjar
  hotjar: {
    id: 123456,
    version: 6,
  },

  // Google Analytics
  ga: {
    measurementId: 'G-XXXXXXXXXX',
  },

  // Métricas customizadas
  metrics: {
    // Performance thresholds
    performance: {
      fcp: 1500, // First Contentful Paint (ms)
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100,  // First Input Delay (ms)
      cls: 0.1,  // Cumulative Layout Shift
      ttfb: 600, // Time to First Byte (ms)
    },

    // Eventos a serem monitorados
    events: [
      'user_login',
      'exercise_start',
      'exercise_complete',
      'achievement_unlock',
      'error_occurrence',
      'offline_mode_enter',
      'offline_mode_exit',
      'sync_complete',
    ],

    // Tags para categorização
    tags: {
      environment: ['production', 'beta', 'development'],
      feature: ['voice', 'gamification', 'offline', 'exercises'],
      severity: ['low', 'medium', 'high', 'critical'],
    },
  },

  // Configurações de amostragem
  sampling: {
    error: 1.0,      // 100% dos erros
    performance: 0.1, // 10% das métricas de performance
    events: 0.5,     // 50% dos eventos de usuário
  },

  // Configurações de retenção
  retention: {
    errorLogs: 30,    // 30 dias
    eventLogs: 90,    // 90 dias
    performanceLogs: 7, // 7 dias
  },
};

// Exemplo de uso:
/*
import { monitoringConfig } from './monitoring.config.example';

// Inicializar Sentry
Sentry.init({
  dsn: monitoringConfig.sentry.dsn,
  tracesSampleRate: monitoringConfig.sentry.tracesSampleRate,
  environment: monitoringConfig.sentry.environment,
});

// Inicializar Mixpanel
mixpanel.init(monitoringConfig.mixpanel.token, {
  debug: monitoringConfig.mixpanel.debug,
  track_pageview: monitoringConfig.mixpanel.track_pageview,
  persistence: monitoringConfig.mixpanel.persistence,
});

// Inicializar Hotjar
hotjar.initialize(
  monitoringConfig.hotjar.id,
  monitoringConfig.hotjar.version
);

// Inicializar Google Analytics
initGA({
  measurementId: monitoringConfig.ga.measurementId,
});
*/ 