const { WebhookClient } = require('discord.js');
require('dotenv').config({ path: 'config/env/.env' });

class DiscordAlerts {
    constructor() {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (!webhookUrl) {
            console.warn('⚠️ URL do webhook do Discord não configurada. Os alertas serão apenas logados.');
            this.webhookClient = null;
        } else {
            this.webhookClient = new WebhookClient({ url: webhookUrl });
        }
    }

    async sendAlert(type, message, error = null) {
        const alerts = {
            'backup-failed': {
                color: 0xFF0000, // Vermelho
                title: '❌ Falha no Backup',
                channel: '#ops-alerts'
            },
            'backup-warning': {
                color: 0xFFA500, // Laranja
                title: '⚠️ Alerta de Backup',
                channel: '#ops-alerts'
            },
            'backup-success': {
                color: 0x00FF00, // Verde
                title: '✅ Backup Concluído',
                channel: '#ops-alerts'
            },
            'restore-failed': {
                color: 0xFF0000,
                title: '❌ Falha na Restauração',
                channel: '#ops-alerts'
            },
            'restore-success': {
                color: 0x00FF00,
                title: '✅ Restauração Concluída',
                channel: '#ops-alerts'
            }
        };

        const alert = alerts[type];
        if (!alert) {
            throw new Error(`Tipo de alerta desconhecido: ${type}`);
        }

        const embed = {
            color: alert.color,
            title: alert.title,
            description: message,
            timestamp: new Date(),
            fields: []
        };

        if (error) {
            embed.fields.push({
                name: 'Erro',
                value: `\`\`\`\n${error.toString()}\n\`\`\``,
                inline: false
            });

            if (error.stack) {
                embed.fields.push({
                    name: 'Stack Trace',
                    value: `\`\`\`\n${error.stack.split('\n').slice(0, 3).join('\n')}\n\`\`\``,
                    inline: false
                });
            }
        }

        // Se não houver webhook configurado, apenas logar
        if (!this.webhookClient) {
            console.log('\n📢 Alerta (Discord desativado):', alert.title);
            console.log('📝 Mensagem:', message);
            if (error) {
                console.log('❌ Erro:', error.message);
            }
            return;
        }

        try {
            await this.webhookClient.send({
                username: 'VocalCoach AI Ops',
                avatarURL: 'https://vocalcoach.ai/logo.png',
                embeds: [embed]
            });

            console.log(`✅ Alerta enviado para ${alert.channel}: ${alert.title}`);
        } catch (err) {
            console.error('❌ Erro ao enviar alerta para o Discord:', err);
            console.log('📝 Conteúdo do alerta:', message);
        }
    }

    async sendBackupSuccess(details) {
        const message = [
            '**Backup concluído com sucesso**',
            '',
            '**Detalhes:**',
            `📂 Local: \`${details.localPath}\``,
            `📦 Tamanho: ${details.size}`,
            `⏱️ Duração: ${details.duration}`,
            `🗃️ Coleções: ${details.collections.join(', ')}`,
            '',
            details.s3Path ? `☁️ S3: \`${details.s3Path}\`` : null
        ].filter(Boolean).join('\n');

        await this.sendAlert('backup-success', message);
    }

    async sendBackupFailed(error, details = {}) {
        const message = [
            '**Falha ao executar backup**',
            '',
            '**Detalhes:**',
            `📂 Local: \`${details.localPath || 'N/A'}\``,
            `⏱️ Timestamp: ${new Date().toISOString()}`,
            '',
            '**Ações Necessárias:**',
            '1. Verificar logs detalhados',
            '2. Executar backup manual',
            '3. Verificar espaço em disco',
            '4. Verificar conectividade com MongoDB'
        ].join('\n');

        await this.sendAlert('backup-failed', message, error);
    }

    async sendBackupWarning(message, details = {}) {
        const formattedMessage = [
            '**Alerta de Backup**',
            '',
            message,
            '',
            '**Detalhes:**',
            Object.entries(details)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')
        ].join('\n');

        await this.sendAlert('backup-warning', formattedMessage);
    }

    async sendRestoreSuccess(details) {
        const message = [
            '**Restauração concluída com sucesso**',
            '',
            '**Detalhes:**',
            `📂 Origem: \`${details.sourcePath}\``,
            `📦 Banco de Dados: \`${details.database}\``,
            `⏱️ Duração: ${details.duration}`,
            `🗃️ Coleções Restauradas: ${details.collections.join(', ')}`,
            `📊 Total de Documentos: ${details.totalDocuments}`
        ].join('\n');

        await this.sendAlert('restore-success', message);
    }

    async sendRestoreFailed(error, details = {}) {
        const message = [
            '**Falha na restauração do backup**',
            '',
            '**Detalhes:**',
            `📂 Origem: \`${details.sourcePath || 'N/A'}\``,
            `📦 Banco de Dados: \`${details.database || 'N/A'}\``,
            `⏱️ Timestamp: ${new Date().toISOString()}`,
            '',
            '**Ações Necessárias:**',
            '1. Verificar integridade do backup',
            '2. Verificar permissões do banco',
            '3. Tentar backup anterior',
            '4. Verificar espaço em disco'
        ].join('\n');

        await this.sendAlert('restore-failed', message, error);
    }
}

// Exportar instância única
module.exports = new DiscordAlerts(); 