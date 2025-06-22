import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logInfo, logError } from './config/logger';
import { connectDatabase, getDatabaseStatus } from './config/database';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Conectar ao banco de dados
connectDatabase();

// Middleware de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logInfo(`HTTP Request: ${message.trim()}`);
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'VocalCoach AI API',
    version: process.env.npm_package_version || '1.0.0',
    database: dbStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API status
app.get('/api/status', (req, res) => {
  const dbStatus = getDatabaseStatus();
  
  res.status(200).json({
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus
  });
});

// Teste de API
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'API funcionando corretamente!',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError('Unhandled error', err, {
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Inicializar servidor
const server = app.listen(PORT, () => {
  logInfo(`🚀 Servidor VocalCoach AI rodando na porta ${PORT}`);
  logInfo(`📊 Health check disponível em http://localhost:${PORT}/health`);
  logInfo(`📡 API status disponível em http://localhost:${PORT}/api/status`);
  logInfo(`🧪 Teste disponível em http://localhost:${PORT}/api/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logInfo('SIGTERM recebido, fechando servidor...');
  server.close(() => {
    logInfo('Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logInfo('SIGINT recebido, fechando servidor...');
  server.close(() => {
    logInfo('Servidor fechado');
    process.exit(0);
  });
});

export default app; 