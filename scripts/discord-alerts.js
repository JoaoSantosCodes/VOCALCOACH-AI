const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const DISCORD_WEBHOOKS = {
    alerts: process.env.DISCORD_WEBHOOK_ALERTS,
    status: process.env.DISCORD_WEBHOOK_STATUS,
    errors: process.env.DISCORD_WEBHOOK_ERRORS
};

const ALERT_COLORS = {
    info: 0x3498db,    // Azul
    warning: 0xf1c40f, // Amarelo
    error: 0xe74c3c,   // Vermelho
    success: 0x2ecc71  // Verde
};

const ALERT_EMOJIS = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
    success: '✅',
    cpu: '🔲',
    memory: '📊',
    api: '🌐',
    database: '🗄️',
    backup: '💾',
    security: '🔒'
};

async function sendDiscordAlert(type, data) {
    const webhook = DISCORD_WEBHOOKS[data.severity === 'error' ? 'errors' : 'alerts'];
    if (!webhook) {
        throw new Error(\`Webhook não configurado para \${type}\`);
    }

    const embed = {
        title: \`\${ALERT_EMOJIS[data.category] || '🔔'} \${data.title}\`,
        description: data.description,
        color: ALERT_COLORS[data.severity || 'info'],
        timestamp: new Date().toISOString(),
        fields: []
    };

    // Adicionar detalhes específicos por tipo
    switch (type) {
        case 'system':
            embed.fields.push(
                {
                    name: '🔲 CPU',
                    value: \`\${data.metrics.cpu_usage}%\`,
                    inline: true
                },
                {
                    name: '📊 Memória',
                    value: \`\${data.metrics.memory_usage}%\`,
                    inline: true
                },
                {
                    name: '⏰ Uptime',
                    value: \`\${Math.floor(data.metrics.uptime / 3600)}h \${Math.floor((data.metrics.uptime % 3600) / 60)}m\`,
                    inline: true
                }
            );
            break;

        case 'api':
            embed.fields.push(
                {
                    name: '🌐 Endpoint',
                    value: data.endpoint,
                    inline: true
                },
                {
                    name: '⏱️ Latência',
                    value: \`\${data.latency}ms\`,
                    inline: true
                },
                {
                    name: '📈 Status',
                    value: data.status,
                    inline: true
                }
            );
            break;

        case 'backup':
            embed.fields.push(
                {
                    name: '📦 Coleções',
                    value: data.collections.join(', '),
                    inline: false
                },
                {
                    name: '📊 Tamanho',
                    value: data.size,
                    inline: true
                },
                {
                    name: '⏱️ Duração',
                    value: data.duration,
                    inline: true
                }
            );
            break;
    }

    // Adicionar campos extras se fornecidos
    if (data.fields) {
        embed.fields.push(...data.fields);
    }

    try {
        await axios.post(webhook, { embeds: [embed] });
        console.log(\`✅ Alerta enviado: \${data.title}\`);
    } catch (error) {
        console.error(\`❌ Erro ao enviar alerta: \${error.message}\`);
        throw error;
    }
}

async function sendStatusUpdate(metrics) {
    if (!DISCORD_WEBHOOKS.status) {
        throw new Error('Webhook de status não configurado');
    }

    const statusEmbed = {
        title: '📊 Status do Sistema',
        description: 'Atualização periódica do status do sistema',
        color: ALERT_COLORS.info,
        timestamp: new Date().toISOString(),
        fields: [
            {
                name: '🔲 CPU',
                value: \`\${metrics.system.cpu_usage}%\`,
                inline: true
            },
            {
                name: '📊 Memória',
                value: \`\${metrics.system.memory_usage}%\`,
                inline: true
            },
            {
                name: '⏰ Uptime',
                value: \`\${Math.floor(metrics.system.uptime / 3600)}h\`,
                inline: true
            }
        ]
    };

    // Adicionar status dos endpoints
    const endpointStatus = metrics.endpoints.map(endpoint => {
        const status = endpoint.status === 'healthy' ? '✅' : '❌';
        return \`\${status} \${endpoint.name}: \${endpoint.latency}ms\`;
    }).join('\\n');

    statusEmbed.fields.push({
        name: '🌐 Endpoints',
        value: endpointStatus,
        inline: false
    });

    try {
        await axios.post(DISCORD_WEBHOOKS.status, { embeds: [statusEmbed] });
        console.log('✅ Status atualizado no Discord');
    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error.message);
        throw error;
    }
}

// Exemplos de uso
async function testAlerts() {
    console.log('🚀 Testando alertas do Discord...\n');

    try {
        // Verificar webhooks
        if (!DISCORD_WEBHOOKS.alerts || !DISCORD_WEBHOOKS.status || !DISCORD_WEBHOOKS.errors) {
            throw new Error(\`
Webhooks do Discord não configurados. Adicione ao .env:
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_STATUS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ERRORS=https://discord.com/api/webhooks/...
\`);
        }

        // Teste 1: Alerta de Sistema
        console.log('1️⃣ Enviando alerta de sistema...');
        await sendDiscordAlert('system', {
            category: 'cpu',
            severity: 'warning',
            title: 'Alto uso de CPU',
            description: 'O uso de CPU está acima do threshold de 80%',
            metrics: {
                cpu_usage: 85,
                memory_usage: 60,
                uptime: 3600 * 24 // 24 horas
            }
        });

        // Teste 2: Alerta de API
        console.log('\n2️⃣ Enviando alerta de API...');
        await sendDiscordAlert('api', {
            category: 'api',
            severity: 'error',
            title: 'Endpoint Indisponível',
            description: 'O endpoint /api/voice/health está inacessível',
            endpoint: '/api/voice/health',
            latency: 5000,
            status: 'error'
        });

        // Teste 3: Alerta de Backup
        console.log('\n3️⃣ Enviando alerta de backup...');
        await sendDiscordAlert('backup', {
            category: 'backup',
            severity: 'success',
            title: 'Backup Concluído',
            description: 'Backup diário realizado com sucesso',
            collections: ['users', 'stats', 'voice'],
            size: '150MB',
            duration: '5m 30s'
        });

        // Teste 4: Status Update
        console.log('\n4️⃣ Enviando atualização de status...');
        await sendStatusUpdate({
            system: {
                cpu_usage: 45,
                memory_usage: 60,
                uptime: 3600 * 72 // 72 horas
            },
            endpoints: [
                { name: 'auth', status: 'healthy', latency: 150 },
                { name: 'voice', status: 'healthy', latency: 200 },
                { name: 'stats', status: 'error', latency: 5000 }
            ]
        });

        console.log('\n✅ Todos os testes concluídos com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante os testes:', error.message);
        process.exit(1);
    }
}

// Exportar funções
module.exports = {
    sendDiscordAlert,
    sendStatusUpdate
};

// Se executado diretamente, rodar testes
if (require.main === module) {
    testAlerts().catch(console.error);
} 