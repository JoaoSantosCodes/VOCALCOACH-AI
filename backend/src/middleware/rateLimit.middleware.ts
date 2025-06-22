import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import logger from '../config/logger';

// Configuração do Redis para rate limiting
const redis = require('redis').createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Rate limiter global
export const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  handler: (req: any, res: any) => {
    logger.error('Rate limit exceeded', new Error('Rate limit exceeded'), {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Muitas requisições deste IP, tente novamente mais tarde.'
    });
  },
});

// Rate limiter para autenticação
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    status: 'error',
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user ? user._id : 'anonymous';
    
    logger.warn('Rate limit exceeded for authentication', {
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(429).json({
      status: 'error',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    });
  },
});

// Rate limiter para API geral
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: {
    status: 'error',
    message: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user ? user._id : 'anonymous';
    
    logger.warn('Rate limit exceeded for API', {
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });

    res.status(429).json({
      status: 'error',
      message: 'Muitas requisições. Tente novamente em 15 minutos.',
    });
  },
});

// Rate limiter para uploads
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads
  message: {
    status: 'error',
    message: 'Limite de uploads excedido. Tente novamente em 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user ? user._id : 'anonymous';
    
    logger.warn('Rate limit exceeded for uploads', {
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(429).json({
      status: 'error',
      message: 'Limite de uploads excedido. Tente novamente em 1 hora.',
    });
  },
});

// Rate limiter para criação de conteúdo
export const contentCreationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 criações
  message: {
    status: 'error',
    message: 'Limite de criação de conteúdo excedido. Tente novamente em 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user ? user._id : 'anonymous';
    
    logger.warn('Rate limit exceeded for content creation', {
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });

    res.status(429).json({
      status: 'error',
      message: 'Limite de criação de conteúdo excedido. Tente novamente em 1 hora.',
    });
  },
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
      apiRateLimit(req, res, next);
    }
  };
};

// Dynamic rate limiter based on user role
export const dynamicRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    // Usuário anônimo - limite mais restritivo
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { status: 'error', message: 'Limite excedido para usuários anônimos.' },
    })(req, res, next);
  }

  // Usuário autenticado - limite baseado no tipo de conta
  const maxRequests = user.role === 'admin' ? 1000 : 
                     user.role === 'premium' ? 500 : 100;

  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    message: { status: 'error', message: 'Limite de requisições excedido.' },
  })(req, res, next);
}; 