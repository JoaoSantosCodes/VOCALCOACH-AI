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

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: authConfig.session.secret,
  resave: false,
  saveUninitialized: false,
}));

// Rate Limiting
app.use(globalLimiter); // Aplicar limite global para todas as rotas

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vocalcoach')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Routes com rate limiting específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/blog', blogRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 