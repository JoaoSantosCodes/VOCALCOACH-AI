import { LogLevel } from '../types/monitoring';

interface WebhookConfig {
    url: string;
    name: string;
    level: LogLevel;
}

interface MonitoringConfig {
    discord: {
        enabled: boolean;
        webhooks: {
            alerts: WebhookConfig;
            errors: WebhookConfig;
            info: WebhookConfig;
            monitoring: WebhookConfig;
            beta: WebhookConfig;
        };
        retryAttempts: number;
        retryDelay: number; // ms
    };
    metrics: {
        enabled: boolean;
        interval: number; // ms
        retention: number; // days
    };
    healthCheck: {
        enabled: boolean;
        interval: number; // ms
        endpoints: string[];
    };
}

const config: MonitoringConfig = {
    discord: {
        enabled: true,
        webhooks: {
            alerts: {
                url: process.env.DISCORD_WEBHOOK_ALERTS || '',
                name: 'VocalCoach-Alerts',
                level: LogLevel.ALERT
            },
            errors: {
                url: process.env.DISCORD_WEBHOOK_ERRORS || '',
                name: 'VocalCoach-Errors',
                level: LogLevel.ERROR
            },
            info: {
                url: process.env.DISCORD_WEBHOOK_MONITORING || '',
                name: 'VocalCoach-Info',
                level: LogLevel.INFO
            },
            monitoring: {
                url: process.env.DISCORD_WEBHOOK_MONITORING || '',
                name: 'VocalCoach-Monitoring',
                level: LogLevel.INFO
            },
            beta: {
                url: process.env.DISCORD_WEBHOOK_BETA || '',
                name: 'VocalCoach-Beta',
                level: LogLevel.INFO
            }
        },
        retryAttempts: 3,
        retryDelay: 1000
    },
    metrics: {
        enabled: true,
        interval: 60000, // 1 minuto
        retention: 30 // 30 dias
    },
    healthCheck: {
        enabled: true,
        interval: 300000, // 5 minutos
        endpoints: [
            '/api/health',
            '/api/voice/status',
            '/api/auth/status'
        ]
    }
};

export default config; 