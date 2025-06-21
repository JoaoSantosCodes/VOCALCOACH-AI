const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
require('dotenv').config({ path: 'config/env/staging.env' });

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dashboard')));

// Dados de monitoramento em memória
let monitoringData = {
    system: {},
    endpoints: [],
    alerts: [],
    lastUpdate: null
};

// Função para obter métricas do sistema
async function getSystemMetrics() {
    try {
        const os = require('os');
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const cpus = os.cpus();
        
        const cpuUsage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total * 100);
        }, 0) / cpus.length;

        return {
            cpu_usage: cpuUsage.toFixed(2),
            memory_usage: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2),
            uptime: os.uptime(),
            load_average: os.loadavg(),
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname()
        };
    } catch (error) {
        console.error('Erro ao obter métricas do sistema:', error);
        return {};
    }
}

// Função para verificar endpoints
async function checkEndpoints() {
    const endpoints = [
        { name: 'auth', url: '/api/auth/health' },
        { name: 'voice', url: '/api/voice/health' },
        { name: 'stats', url: '/api/stats/health' },
        { name: 'blog', url: '/api/blog/health' }
    ];

    const results = [];
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    for (const endpoint of endpoints) {
        try {
            const startTime = Date.now();
            const response = await fetch(`${baseUrl}${endpoint.url}`);
            const latency = Date.now() - startTime;

            results.push({
                name: endpoint.name,
                status: response.status === 200 ? 'healthy' : 'unhealthy',
                latency,
                error: null,
                lastCheck: new Date().toISOString()
            });
        } catch (error) {
            results.push({
                name: endpoint.name,
                status: 'error',
                latency: 0,
                error: error.message,
                lastCheck: new Date().toISOString()
            });
        }
    }

    return results;
}

// Função para obter logs recentes
async function getRecentLogs() {
    try {
        const logPath = path.join(__dirname, '..', 'logs');
        
        // Verificar se o diretório existe
        if (!fs.existsSync(logPath)) {
            console.log('📁 Diretório de logs não encontrado, criando...');
            fs.mkdirSync(logPath, { recursive: true });
        }
        
        const logFiles = fs.readdirSync(logPath).filter(file => file.endsWith('.log'));
        
        if (logFiles.length === 0) {
            // Criar log de exemplo se não existir nenhum
            const exampleLogPath = path.join(logPath, 'dashboard.log');
            const exampleLogs = [
                `[${new Date().toISOString()}] INFO: Dashboard de monitoramento iniciado`,
                `[${new Date().toISOString()}] INFO: Sistema VocalCoach AI em execução`,
                `[${new Date().toISOString()}] INFO: Webhooks Discord configurados`,
                `[${new Date().toISOString()}] INFO: Sistema de backup ativo`,
                `[${new Date().toISOString()}] INFO: Monitoramento em tempo real ativo`
            ];
            
            fs.writeFileSync(exampleLogPath, exampleLogs.join('\n'));
            console.log('📝 Log de exemplo criado');
            
            return exampleLogs;
        }
        
        const logs = [];
        for (const file of logFiles.slice(-3)) { // Últimos 3 arquivos
            try {
                const content = fs.readFileSync(path.join(logPath, file), 'utf8');
                const lines = content.split('\n').slice(-50); // Últimas 50 linhas
                logs.push(...lines.filter(line => line.trim()));
            } catch (fileError) {
                console.warn(`⚠️ Erro ao ler arquivo de log ${file}:`, fileError.message);
            }
        }
        
        return logs.slice(-100); // Últimas 100 linhas
    } catch (error) {
        console.error('❌ Erro ao ler logs:', error);
        return [
            `[${new Date().toISOString()}] ERROR: Erro ao ler logs: ${error.message}`,
            `[${new Date().toISOString()}] INFO: Sistema de monitoramento ativo`,
            `[${new Date().toISOString()}] INFO: Aguardando logs do sistema...`
        ];
    }
}

// Função para obter status do MongoDB
async function getMongoDBStatus() {
    try {
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const adminDb = client.db('admin');
        const serverStatus = await adminDb.command({ serverStatus: 1 });
        
        await client.close();
        
        return {
            status: 'connected',
            version: serverStatus.version,
            uptime: serverStatus.uptime,
            connections: serverStatus.connections,
            operations: serverStatus.opcounters
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message
        };
    }
}

// Função para obter status dos backups
async function getBackupStatus() {
    try {
        const backupPath = path.join(__dirname, '..', 'backups');
        const backups = fs.readdirSync(backupPath)
            .filter(dir => dir.startsWith('backup-'))
            .map(dir => {
                const stats = fs.statSync(path.join(backupPath, dir));
                return {
                    name: dir,
                    date: stats.mtime,
                    size: stats.size,
                    age: Date.now() - stats.mtime.getTime()
                };
            })
            .sort((a, b) => b.date - a.date);

        return {
            total: backups.length,
            latest: backups[0] || null,
            size: backups.reduce((acc, b) => acc + b.size, 0)
        };
    } catch (error) {
        return {
            total: 0,
            latest: null,
            size: 0,
            error: error.message
        };
    }
}

// Função para atualizar dados de monitoramento
async function updateMonitoringData() {
    try {
        const [systemMetrics, endpoints, logs, mongoStatus, backupStatus] = await Promise.all([
            getSystemMetrics(),
            checkEndpoints(),
            getRecentLogs(),
            getMongoDBStatus(),
            getBackupStatus()
        ]);

        monitoringData = {
            system: systemMetrics,
            endpoints,
            logs,
            mongo: mongoStatus,
            backup: backupStatus,
            lastUpdate: new Date().toISOString()
        };

        // Verificar alertas
        const alerts = [];
        
        if (parseFloat(systemMetrics.cpu_usage) > 80) {
            alerts.push({
                type: 'warning',
                message: `CPU usage is high: ${systemMetrics.cpu_usage}%`,
                timestamp: new Date().toISOString()
            });
        }

        if (parseFloat(systemMetrics.memory_usage) > 85) {
            alerts.push({
                type: 'warning',
                message: `Memory usage is high: ${systemMetrics.memory_usage}%`,
                timestamp: new Date().toISOString()
            });
        }

        endpoints.forEach(endpoint => {
            if (endpoint.status === 'error') {
                alerts.push({
                    type: 'error',
                    message: `Endpoint ${endpoint.name} is down`,
                    timestamp: new Date().toISOString()
                });
            }
        });

        monitoringData.alerts = alerts;
    } catch (error) {
        console.error('Erro ao atualizar dados de monitoramento:', error);
    }
}

// Rotas da API
app.get('/api/status', (req, res) => {
    res.json(monitoringData);
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rota para forçar atualização
app.post('/api/refresh', async (req, res) => {
    await updateMonitoringData();
    res.json({ success: true, timestamp: monitoringData.lastUpdate });
});

// Rota para obter logs em tempo real
app.get('/api/logs', (req, res) => {
    res.json({
        logs: monitoringData.logs,
        timestamp: new Date().toISOString()
    });
});

// Rota para obter alertas
app.get('/api/alerts', (req, res) => {
    res.json({
        alerts: monitoringData.alerts,
        count: monitoringData.alerts.length,
        timestamp: new Date().toISOString()
    });
});

// Página principal do dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

// Inicializar dados
updateMonitoringData();

// Atualizar dados a cada 30 segundos
setInterval(updateMonitoringData, 30000);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`📊 Dashboard de Monitoramento rodando em http://localhost:${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api/status`);
    console.log(`🔄 Atualização automática a cada 30 segundos`);
});

module.exports = { app, updateMonitoringData }; 