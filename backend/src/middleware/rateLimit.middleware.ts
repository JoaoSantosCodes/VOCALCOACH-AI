import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { logger } from '../config/logger';

// Criar cliente Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

redis.on('error', (error) => {
  logger.error('Erro na conexão com Redis:', error);
});

// Configuração base do rate limit
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    });
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
};

// Rate limit para rotas de autenticação
export const authLimiter = rateLimit({
  ...baseConfig,
  max: 5, // 5 tentativas
  windowMs: 15 * 60 * 1000, // 15 minutos
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});

// Rate limit para API geral
export const apiLimiter = rateLimit({
  ...baseConfig,
  max: 100, // 100 requisições
  windowMs: 15 * 60 * 1000, // 15 minutos
});

// Rate limit para uploads
export const uploadLimiter = rateLimit({
  ...baseConfig,
  max: 10, // 10 uploads
  windowMs: 60 * 60 * 1000, // 1 hora
});

// Rate limit para análise de voz
export const voiceAnalysisLimiter = rateLimit({
  ...baseConfig,
  max: 50, // 50 análises
  windowMs: 60 * 60 * 1000, // 1 hora
});

// Rate limiter for user registration
export const registrationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 3 registration attempts per day
  message: 'Too many accounts created from this IP, please try again after 24 hours',
});

// Rate limiter for password reset requests
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again after an hour',
});

// Rate limiter for public API endpoints
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per 15 minutes
});

// Rate limiter for webhook endpoints
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 webhook calls per minute
});

// Configurable rate limiter creator for specific routes
export const createCustomRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message,
  });
};

// Skip rate limiting for trusted IPs
export const skipRateLimitForTrustedIPs = (trustedIPs: string[]) => {
  return (req: any, res: any, next: any) => {
    if (trustedIPs.includes(req.ip)) {
      next();
    } else {
      apiLimiter(req, res, next);
    }
  };
};

// Dynamic rate limiter based on user role
export const dynamicRateLimiter = (roleConfig: Record<string, { windowMs: number; max: number }>) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role || 'anonymous';
    const config = roleConfig[userRole] || roleConfig.anonymous;

    rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: `Rate limit exceeded for ${userRole} role`,
    })(req, res, next);
  };
}; 