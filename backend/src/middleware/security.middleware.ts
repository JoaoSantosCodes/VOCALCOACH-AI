import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import csrf from 'csurf';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import { createHash, randomBytes } from 'crypto';

// Configuração do rate limiter global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
});

// Configuração do CSRF
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

export class SecurityMiddleware {
  // Middleware principal de segurança
  static configureSecurityMiddleware(app: any) {
    // Helmet - Headers de segurança
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://api.vocalcoach.ai'],
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: { policy: 'same-site' },
        dnsPrefetchControl: true,
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      })
    );

    // Rate limiting global
    app.use(limiter);

    // Proteção XSS
    app.use(xss());

    // Sanitização de dados MongoDB
    app.use(mongoSanitize());

    // Proteção contra Parameter Pollution
    app.use(hpp());

    // CSRF Protection para rotas não-API
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (!req.path.startsWith('/api/')) {
        return csrfProtection(req, res, next);
      }
      next();
    });

    // Middleware de validação de upload
    app.use(this.validateFileUpload);

    // Middleware de sanitização de entrada
    app.use(this.sanitizeInput);
  }

  // Validação de upload de arquivos
  private static validateFileUpload(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!req.files) return next();

    const files = Array.isArray(req.files) ? req.files : [req.files];
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      // Verifica tipo do arquivo
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Tipo de arquivo não permitido',
          message: 'Apenas imagens e áudios são permitidos',
        });
      }

      // Verifica tamanho
      if (file.size > maxSize) {
        return res.status(400).json({
          error: 'Arquivo muito grande',
          message: 'O tamanho máximo permitido é 5MB',
        });
      }

      // Verifica nome do arquivo
      const safeName = this.sanitizeFileName(file.originalname);
      file.originalname = safeName;
    }

    next();
  }

  // Sanitização de entrada
  private static sanitizeInput(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Sanitiza query params
    if (req.query) {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = this.sanitizeString(req.query[key] as string);
        }
      }
    }

    // Sanitiza body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    next();
  }

  // Sanitiza um objeto recursivamente
  private static sanitizeObject(obj: any): any {
    if (!obj) return obj;

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }

  // Sanitiza uma string
  private static sanitizeString(str: string): string {
    // Remove caracteres perigosos
    str = str.replace(/[<>]/g, '');
    // Remove possíveis scripts
    str = str.replace(/(javascript|script|eval|expression)/gi, '');
    // Remove comentários HTML
    str = str.replace(/<!--[\s\S]*?-->/g, '');
    return str.trim();
  }

  // Sanitiza nome de arquivo
  private static sanitizeFileName(fileName: string): string {
    // Remove caracteres especiais e espaços
    const sanitized = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\s+/g, '_');
    
    // Adiciona hash para evitar colisões
    const hash = createHash('sha256')
      .update(fileName + randomBytes(16).toString('hex'))
      .digest('hex')
      .substring(0, 8);
    
    const ext = sanitized.split('.').pop();
    const name = sanitized.split('.').slice(0, -1).join('.');
    
    return `${name}_${hash}.${ext}`;
  }
} 