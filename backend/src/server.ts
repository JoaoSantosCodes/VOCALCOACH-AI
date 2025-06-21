import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { authConfig } from './config/auth.config';
import authRoutes from './routes/auth.routes';
import './config/passport';
import statsRoutes from './routes/stats.routes';
import achievementRoutes from './routes/achievement.routes';
import blogRoutes from './routes/blog.routes';
import voiceRoutes from './routes/voice.routes';
import { globalLimiter, authLimiter } from './middleware/rateLimit.middleware';
import helmet from 'helmet';
import { corsOptions } from './config/cors.config';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { logger } from './config/logger';
import { helmetConfig, sanitizeInput } from './config/security.config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';

const app = express();

// Middlewares de segurança
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Rate limiting global
app.use(apiLimiter);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vocalcoach')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

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
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/blog', blogRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
}); 