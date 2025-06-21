import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import mixpanel from 'mixpanel-browser';
import { hotjar } from 'react-hotjar';
import { init as initGA } from '@analytics/google-analytics';

// Configurações do ambiente
const isProd = process.env.NODE_ENV === 'production';
const isBeta = process.env.REACT_APP_BETA === 'true';

// Configuração do Sentry
export const initSentry = () => {
  if (isProd || isBeta) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: isProd ? 0.1 : 1.0,
      environment: isProd ? 'production' : 'beta',
      beforeSend(event) {
        // Não enviar eventos em desenvolvimento
        if (!isProd && !isBeta) return null;
        return event;
      },
    });
  }
};

// Configuração do Mixpanel
export const initMixpanel = () => {
  if (isProd || isBeta) {
    mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN as string, {
      debug: !isProd,
      track_pageview: true,
      persistence: 'localStorage',
    });
  }
};

// Configuração do Hotjar
export const initHotjar = () => {
  if (isProd || isBeta) {
    hotjar.initialize(
      parseInt(process.env.REACT_APP_HOTJAR_ID || '0', 10),
      parseInt(process.env.REACT_APP_HOTJAR_VERSION || '6', 10)
    );
  }
};

// Configuração do Google Analytics
export const initGA = () => {
  if (isProd || isBeta) {
    initGA({
      measurementId: process.env.REACT_APP_GA_ID as string,
    });
  }
};

// Métricas customizadas
export const metrics = {
  // Performance
  trackPerformance: (metric: {
    name: string;
    value: number;
    tags?: Record<string, string>;
  }) => {
    if (!isProd && !isBeta) return;

    // Enviar para Sentry
    Sentry.captureMessage('Performance Metric', {
      level: 'info',
      extra: metric,
    });

    // Enviar para Mixpanel
    mixpanel.track('Performance Metric', metric);
  },

  // Erros
  trackError: (error: Error, context?: Record<string, any>) => {
    if (!isProd && !isBeta) return;

    // Enviar para Sentry
    Sentry.captureException(error, {
      extra: context,
    });

    // Enviar para Mixpanel
    mixpanel.track('Error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  },

  // Eventos de usuário
  trackEvent: (name: string, properties?: Record<string, any>) => {
    if (!isProd && !isBeta) return;

    // Enviar para Mixpanel
    mixpanel.track(name, properties);

    // Enviar para GA
    if (window.gtag) {
      window.gtag('event', name, properties);
    }
  },

  // Web Vitals
  trackWebVitals: (metric: {
    name: string;
    value: number;
    id: string;
  }) => {
    if (!isProd && !isBeta) return;

    // Enviar para GA
    if (window.gtag) {
      window.gtag('event', 'web-vitals', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.value),
        metric_id: metric.id,
      });
    }

    // Enviar para Sentry
    Sentry.captureMessage('Web Vitals', {
      level: 'info',
      extra: metric,
    });
  },
};

// Inicialização de todas as ferramentas
export const initMonitoring = () => {
  initSentry();
  initMixpanel();
  initHotjar();
  initGA();
};

// Tipos para as métricas
export interface PerformanceMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
}

// Declaração de tipos para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default {
  initMonitoring,
  metrics,
}; 