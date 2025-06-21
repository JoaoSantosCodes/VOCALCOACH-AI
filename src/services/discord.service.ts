import axios, { AxiosError } from 'axios';
import config from '../config/monitoring.config';
import { LogLevel, LogMessage, WebhookPayload, WebhookResponse } from '../types/monitoring';

class DiscordService {
    private static instance: DiscordService;
    private readonly webhooks: typeof config.discord.webhooks;
    private readonly retryAttempts: number;
    private readonly retryDelay: number;

    private constructor() {
        this.webhooks = config.discord.webhooks;
        this.retryAttempts = config.discord.retryAttempts;
        this.retryDelay = config.discord.retryDelay;
    }

    public static getInstance(): DiscordService {
        if (!DiscordService.instance) {
            DiscordService.instance = new DiscordService();
        }
        return DiscordService.instance;
    }

    private getColorByLevel(level: LogLevel): number {
        const colors = {
            [LogLevel.DEBUG]: 0x7289DA,  // Azul Discord
            [LogLevel.INFO]: 0x3498DB,   // Azul Info
            [LogLevel.WARN]: 0xF1C40F,   // Amarelo
            [LogLevel.ERROR]: 0xE74C3C,  // Vermelho
            [LogLevel.ALERT]: 0xFF5733,  // Laranja
            [LogLevel.CRITICAL]: 0x992D22 // Vermelho escuro
        };
        return colors[level] || colors[LogLevel.INFO];
    }

    private async sendWebhook(
        webhookUrl: string,
        payload: WebhookPayload,
        attempt = 1
    ): Promise<WebhookResponse> {
        try {
            const response = await axios.post(webhookUrl, payload);
            return {
                success: true,
                status: response.status
            };
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 429 && attempt < this.retryAttempts) {
                const retryAfter = (axiosError.response.data as any).retry_after || this.retryDelay;
                await new Promise(resolve => setTimeout(resolve, retryAfter));
                return this.sendWebhook(webhookUrl, payload, attempt + 1);
            }

            return {
                success: false,
                status: axiosError.response?.status || 500,
                message: axiosError.message,
                retryAfter: (axiosError.response?.data as any)?.retry_after
            };
        }
    }

    public async sendLog(log: LogMessage): Promise<WebhookResponse> {
        const webhook = Object.values(this.webhooks).find(w => w.level === log.level);
        
        if (!webhook || !webhook.url) {
            throw new Error(`No webhook configured for level: ${log.level}`);
        }

        const payload: WebhookPayload = {
            username: webhook.name,
            embeds: [{
                title: `${log.level.toUpperCase()} - ${log.source || 'Sistema'}`,
                description: log.message,
                color: this.getColorByLevel(log.level),
                fields: log.context ? Object.entries(log.context).map(([key, value]) => ({
                    name: key,
                    value: JSON.stringify(value, null, 2),
                    inline: true
                })) : [],
                timestamp: log.timestamp.toISOString(),
                footer: {
                    text: 'VocalCoach AI Monitoring'
                }
            }]
        };

        return this.sendWebhook(webhook.url, payload);
    }

    public async sendAlert(
        title: string,
        message: string,
        level: LogLevel = LogLevel.ALERT,
        context?: Record<string, any>
    ): Promise<WebhookResponse> {
        return this.sendLog({
            level,
            message,
            timestamp: new Date(),
            context: {
                title,
                ...context
            },
            source: 'Alert System'
        });
    }

    public async sendBetaUpdate(
        title: string,
        message: string,
        metrics?: Record<string, any>
    ): Promise<WebhookResponse> {
        const webhook = this.webhooks.beta;
        
        if (!webhook.url) {
            throw new Error('Beta webhook not configured');
        }

        const payload: WebhookPayload = {
            username: webhook.name,
            embeds: [{
                title: `📊 Beta Update: ${title}`,
                description: message,
                color: 0x00FF00,
                fields: metrics ? Object.entries(metrics).map(([key, value]) => ({
                    name: key,
                    value: JSON.stringify(value, null, 2),
                    inline: true
                })) : [],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'VocalCoach AI Beta Program'
                }
            }]
        };

        return this.sendWebhook(webhook.url, payload);
    }

    public async testWebhook(webhookName: keyof typeof config.discord.webhooks): Promise<WebhookResponse> {
        const webhook = this.webhooks[webhookName];
        
        if (!webhook.url) {
            throw new Error(`Webhook ${webhookName} not configured`);
        }

        const payload: WebhookPayload = {
            username: webhook.name,
            content: `🔍 Test message from ${webhook.name}`,
            embeds: [{
                title: 'Webhook Test',
                description: 'This is a test message to verify the webhook configuration.',
                color: 0x00FF00,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'VocalCoach AI Monitoring - Test'
                }
            }]
        };

        return this.sendWebhook(webhook.url, payload);
    }
}

export const discordService = DiscordService.getInstance(); 