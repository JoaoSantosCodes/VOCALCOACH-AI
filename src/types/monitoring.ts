export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    ALERT = 'alert',
    CRITICAL = 'critical'
}

export interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
    source?: string;
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    checks: {
        name: string;
        status: 'pass' | 'fail';
        message?: string;
        latency?: number;
    }[];
}

export interface MetricData {
    name: string;
    value: number;
    timestamp: Date;
    tags?: Record<string, string>;
}

export interface AlertConfig {
    name: string;
    condition: string;
    threshold: number;
    period: number; // minutos
    channels: string[];
}

export interface WebhookPayload {
    content?: string;
    embeds?: {
        title?: string;
        description?: string;
        color?: number;
        fields?: {
            name: string;
            value: string;
            inline?: boolean;
        }[];
        footer?: {
            text: string;
            icon_url?: string;
        };
        timestamp?: string;
    }[];
    username?: string;
    avatar_url?: string;
}

export interface MonitoringService {
    log(message: LogMessage): Promise<void>;
    checkHealth(): Promise<HealthStatus>;
    recordMetric(metric: MetricData): Promise<void>;
    sendAlert(alert: AlertConfig, data: any): Promise<void>;
}

export interface WebhookResponse {
    success: boolean;
    status: number;
    message?: string;
    retryAfter?: number;
} 