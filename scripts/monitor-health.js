const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { sendDiscordAlert, sendStatusUpdate } = require('./discord-alerts');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const METRICS_DIR = path.join(__dirname, '..', 'metrics');
const ALERT_THRESHOLDS = {
    cpu_usage: 80, // 80%
    memory_usage: 85, // 85%
    api_latency: 1000, // 1 segundo
    error_rate: 5 // 5%
};

// Endpoints para monitorar
const ENDPOINTS = [
    { name: 'auth', url: '/api/auth/health' },
    { name: 'voice', url: '/api/voice/health' },
    { name: 'stats', url: '/api/stats/health' },
    { name: 'blog', url: '/api/blog/health' }
];

async function createMetricsDirectory() {
    try {
        await fs.mkdir(METRICS_DIR, { recursive: true });
        console.log('✅ Diretório de métricas criado:', METRICS_DIR);
    } catch (error) {
        console.error('❌ Erro ao criar diretório de métricas:', error);
    }
}

async function getSystemMetrics() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    const cpuUsage = cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b);
        const idle = cpu.times.idle;
        return acc + ((total - idle) / total * 100);
    }, 0) / cpus.length;

    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    return {
        cpu_usage: cpuUsage.toFixed(2),
        memory_usage: memoryUsage.toFixed(2),
        uptime: os.uptime(),
        load_average: os.loadavg()
    };
}

async function checkEndpointHealth(endpoint) {
    const startTime = Date.now();
    try {
        const response = await axios.get(\`\${process.env.API_BASE_URL}\${endpoint.url}\`);
        const latency = Date.now() - startTime;

        return {
            name: endpoint.name,
            status: response.status === 200 ? 'healthy' : 'unhealthy',
            latency,
            error: null
        };
    } catch (error) {
        return {
            name: endpoint.name,
            status: 'error',
            latency: Date.now() - startTime,
            error: error.message
        };
    }
}

async function saveMetrics(metrics) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(METRICS_DIR, `metrics-${timestamp}.json`);

    try {
        await fs.writeFile(filePath, JSON.stringify(metrics, null, 2));
    } catch (error) {
        console.error('❌ Erro ao salvar métricas:', error);
    }
}

async function checkAlerts(metrics) {
    const alerts = [];

    // Verificar CPU
    if (parseFloat(metrics.system.cpu_usage) > ALERT_THRESHOLDS.cpu_usage) {
        alerts.push(`🚨 CPU usage is high: ${metrics.system.cpu_usage}%`);
    }

    // Verificar Memória
    if (parseFloat(metrics.system.memory_usage) > ALERT_THRESHOLDS.memory_usage) {
        alerts.push(`🚨 Memory usage is high: ${metrics.system.memory_usage}%`);
    }

    // Verificar Latência da API
    metrics.endpoints.forEach(endpoint => {
        if (endpoint.latency > ALERT_THRESHOLDS.api_latency) {
            alerts.push(`🚨 High latency on ${endpoint.name}: ${endpoint.latency}ms`);
        }
        if (endpoint.status === 'error') {
            alerts.push(`🚨 Error on ${endpoint.name}: ${endpoint.error}`);
        }
    });

    return alerts;
}

async function monitorHealth() {
    console.log('🔍 Iniciando verificação de saúde...\n');

    try {
        // Verificar variáveis de ambiente
        if (!process.env.API_BASE_URL) {
            throw new Error('API_BASE_URL não configurada');
        }

        // Coletar métricas
        const systemMetrics = await getSystemMetrics();
        const endpointHealth = await Promise.all(
            ENDPOINTS.map(endpoint => checkEndpointHealth(endpoint))
        );

        // Consolidar métricas
        const metrics = {
            timestamp: new Date().toISOString(),
            system: systemMetrics,
            endpoints: endpointHealth
        };

        // Salvar métricas
        await saveMetrics(metrics);

        // Verificar alertas
        const alerts = await checkAlerts(metrics);

        // Enviar alertas para o Discord
        for (const alert of alerts) {
            const [type, severity] = alert.split(':');
            const message = alert.substring(alert.indexOf(' ') + 1);

            await sendDiscordAlert(type.toLowerCase(), {
                category: type.toLowerCase(),
                severity: severity.toLowerCase(),
                title: message,
                description: \`Detectado em \${new Date().toLocaleString()}\`,
                metrics: systemMetrics
            });
        }

        // Atualizar status no Discord
        await sendStatusUpdate(metrics);

        // Exibir resultados
        console.log('📊 Métricas do Sistema:');
        console.log(\`CPU: \${systemMetrics.cpu_usage}%\`);
        console.log(\`Memória: \${systemMetrics.memory_usage}%\`);
        console.log(\`Uptime: \${systemMetrics.uptime} segundos\`);

        console.log('\n🌐 Status dos Endpoints:');
        endpointHealth.forEach(endpoint => {
            const status = endpoint.status === 'healthy' ? '✅' : '❌';
            console.log(\`\${status} \${endpoint.name}: \${endpoint.latency}ms\`);
        });

        if (alerts.length > 0) {
            console.log('\n⚠️ Alertas:');
            alerts.forEach(alert => console.log(alert));
        }

    } catch (error) {
        console.error('\n❌ Erro durante monitoramento:', error);
        
        // Enviar alerta de erro para o Discord
        await sendDiscordAlert('system', {
            category: 'error',
            severity: 'error',
            title: 'Erro no Sistema de Monitoramento',
            description: error.message,
            fields: [
                {
                    name: '🔍 Detalhes',
                    value: error.stack || 'Sem stack trace disponível',
                    inline: false
                }
            ]
        });
    }
}

// Criar diretório de métricas
createMetricsDirectory();

// Iniciar monitoramento
console.log(\`🚀 Iniciando monitoramento (intervalo: \${HEALTH_CHECK_INTERVAL/1000}s)\n\`);
setInterval(monitorHealth, HEALTH_CHECK_INTERVAL);
monitorHealth(); 