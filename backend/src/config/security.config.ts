import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// Configuração do Content Security Policy
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.example.com'],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
  },
  reportOnly: false,
};

// Middleware para sanitizar entrada de dados
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    const sanitized = sanitizeObject(req.body);
    req.body = sanitized;
  }

  if (req.query) {
    const sanitized = sanitizeObject(req.query);
    req.query = sanitized;
  }

  if (req.params) {
    const sanitized = sanitizeObject(req.params);
    req.params = sanitized;
  }

  next();
};

// Função recursiva para sanitizar objetos
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? xss(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

// Configuração do Helmet
export const helmetConfig = {
  // Habilitar X-XSS-Protection
  xssFilter: true,

  // Configurar X-Frame-Options
  frameguard: {
    action: 'deny',
  },

  // Configurar X-Content-Type-Options
  noSniff: true,

  // Configurar Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Configurar HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // Desabilitar X-Powered-By
  hidePoweredBy: true,

  // Configurar CSP
  contentSecurityPolicy: {
    useDefaults: true,
    directives: cspConfig.directives,
  },
};

export const DISCORD_CHANNELS = {
  GENERAL: '1385873899249733642',
  BUGS: '1385873971043369030',
  FEEDBACK: '1385874022298026020',
  ANNOUNCEMENTS: '1385874296185950379'
}; 