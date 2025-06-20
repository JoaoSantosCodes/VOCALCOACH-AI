import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Configuração do logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

interface AuditLog {
  eventId: string;
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  status: number;
  details?: any;
}

export const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const eventId = uuidv4();

  // Captura a resposta original
  const originalSend = res.send;
  res.send = function (body: any): Response {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const logEntry: AuditLog = {
      eventId,
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id,
      action: req.method,
      resource: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
      status: res.statusCode,
      details: {
        duration,
        query: req.query,
        params: req.params,
        body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
      },
    };

    auditLogger.info('Audit Log Entry', logEntry);
    
    // Chama o método send original
    return originalSend.call(this, body);
  };

  next();
};

// Função para sanitizar dados sensíveis
const sanitizeBody = (body: any): any => {
  const sensitiveFields = ['password', 'token', 'secret', 'creditCard'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

// Middleware específico para eventos de segurança
export const securityAuditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const securityEvents = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/2fa',
    '/api/user/password',
  ];

  if (securityEvents.some(event => req.path.includes(event))) {
    const logEntry: AuditLog = {
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id,
      action: 'SECURITY_EVENT',
      resource: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
      status: res.statusCode,
      details: {
        event: req.path,
        method: req.method,
      },
    };

    auditLogger.warn('Security Event', logEntry);
  }

  next();
}; 