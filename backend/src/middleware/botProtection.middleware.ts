import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import UAParser from 'ua-parser-js';
import { createHash } from 'crypto';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configuração do rate limiter
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'bot_protection',
  points: 100, // Número de requisições
  duration: 60, // Por minuto
});

export class BotProtectionMiddleware {
  // Lista de User Agents conhecidos de bots maliciosos
  private static readonly KNOWN_BAD_BOTS = [
    'zgrab',
    'semrush',
    'python-requests',
    'go-http-client',
    'curl',
    'wget',
  ];

  // Padrões suspeitos de comportamento
  private static readonly SUSPICIOUS_PATTERNS = [
    '/wp-admin',
    '/wp-login',
    '/xmlrpc.php',
    '/administrator',
    '.php',
    '.asp',
  ];

  // Middleware principal de proteção
  static async protect(req: Request, res: Response, next: NextFunction) {
    try {
      // Verifica rate limit
      await rateLimiter.consume(req.ip);

      // Executa todas as verificações
      const checks = await Promise.all([
        this.checkUserAgent(req),
        this.checkBehaviorPattern(req),
        this.checkHoneypot(req),
        this.validateClientFingerprint(req),
      ]);

      // Se alguma verificação falhar, bloqueia a requisição
      if (checks.some(check => !check)) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Comportamento suspeito detectado',
        });
      }

      next();
    } catch (error) {
      if (error.name === 'RateLimiterRes') {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Por favor, tente novamente mais tarde',
        });
      }
      next(error);
    }
  }

  // Verifica User Agent
  private static async checkUserAgent(req: Request): Promise<boolean> {
    const ua = req.get('user-agent') || '';
    const parser = new UAParser(ua);
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // Verifica bots conhecidos
    if (this.KNOWN_BAD_BOTS.some(bot => ua.toLowerCase().includes(bot))) {
      await this.logBotAttempt(req, 'known_bad_bot');
      return false;
    }

    // Verifica inconsistências no User Agent
    if (!browser.name || !os.name) {
      await this.logBotAttempt(req, 'invalid_user_agent');
      return false;
    }

    return true;
  }

  // Verifica padrões de comportamento suspeito
  private static async checkBehaviorPattern(req: Request): Promise<boolean> {
    const path = req.path.toLowerCase();

    // Verifica padrões suspeitos na URL
    if (this.SUSPICIOUS_PATTERNS.some(pattern => path.includes(pattern))) {
      await this.logBotAttempt(req, 'suspicious_pattern');
      return false;
    }

    // Verifica headers suspeitos
    const suspiciousHeaders = [
      'proxy-connection',
      'x-forwarded-host',
      'x-forwarded-port',
      'x-forwarded-proto',
    ];

    if (suspiciousHeaders.some(header => req.get(header))) {
      await this.logBotAttempt(req, 'suspicious_headers');
      return false;
    }

    return true;
  }

  // Verifica se é uma requisição para honeypot
  private static async checkHoneypot(req: Request): Promise<boolean> {
    const honeypotPaths = [
      '/admin/login',
      '/wp-admin',
      '/phpmyadmin',
      '/mysql',
    ];

    if (honeypotPaths.some(path => req.path.includes(path))) {
      await this.logBotAttempt(req, 'honeypot_triggered');
      return false;
    }

    return true;
  }

  // Valida fingerprint do cliente
  private static async validateClientFingerprint(req: Request): Promise<boolean> {
    const fingerprint = req.get('x-client-fingerprint');
    if (!fingerprint) return true; // Ignora se não houver fingerprint

    const key = `fingerprint:${fingerprint}`;
    const stored = await redis.get(key);

    if (stored) {
      const data = JSON.parse(stored);
      
      // Verifica se o fingerprint está sendo usado de forma suspeita
      if (data.ips.length > 5 || data.userAgents.length > 3) {
        await this.logBotAttempt(req, 'fingerprint_abuse');
        return false;
      }

      // Atualiza dados do fingerprint
      data.ips = [...new Set([...data.ips, req.ip])];
      data.userAgents = [...new Set([...data.userAgents, req.get('user-agent')])];
      await redis.setex(key, 86400, JSON.stringify(data)); // 24 horas
    } else {
      // Cria novo registro de fingerprint
      await redis.setex(
        key,
        86400,
        JSON.stringify({
          ips: [req.ip],
          userAgents: [req.get('user-agent')],
          createdAt: new Date(),
        })
      );
    }

    return true;
  }

  // Registra tentativa de bot
  private static async logBotAttempt(
    req: Request,
    type: string
  ): Promise<void> {
    const data = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path,
      method: req.method,
      type,
      timestamp: new Date(),
      headers: req.headers,
    };

    await redis.lpush('bot_attempts', JSON.stringify(data));
    await redis.ltrim('bot_attempts', 0, 999); // Mantém últimos 1000 registros

    // Incrementa contagem para análise
    const key = `bot_stats:${type}:${new Date().toISOString().split('T')[0]}`;
    await redis.incr(key);
    await redis.expire(key, 2592000); // 30 dias
  }
} 