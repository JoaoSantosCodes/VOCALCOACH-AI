import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './routes/auth.routes';
import './config/passport';
import statsRoutes from './routes/stats.routes';
import achievementRoutes from './routes/achievement.routes';
import blogRoutes from './routes/blog.routes';
import voiceRoutes from './routes/voice.routes';
import { globalLimiter, authRateLimit } from './middleware/rateLimit.middleware';
import helmet from 'helmet';
import { corsOptions } from './config/cors.config';
import { helmetConfig, sanitizeInput } from './config/security.config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import morgan from 'morgan';
import { logInfo, logError } from './config/logger';
import { connectDatabase, getDatabaseStatus } from './config/database';

const app: Application = express();

// Middlewares de segurança
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Rate limiting global
app.use(globalLimiter);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conectar ao MongoDB
connectDatabase();

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'VocalCoach AI API Documentation',
}));

// Endpoint para baixar a especificação OpenAPI
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes com rate limiting específico
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/blog', blogRoutes);

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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logInfo(`🚀 Servidor VocalCoach AI rodando na porta ${PORT}`);
  logInfo(`📊 Health check disponível em http://localhost:${PORT}/health`);
  logInfo(`📡 API status disponível em http://localhost:${PORT}/api/status`);
  logInfo(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
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