import rateLimit from 'express-rate-limit';
import { authConfig } from '../config/auth.config';
import { logSecurity } from '../config/logger';

// Base rate limiter configuration
const createRateLimiter = (options: Partial<rateLimit.Options>) => {
  return rateLimit({
    windowMs: authConfig.rateLimit.windowMs,
    max: authConfig.rateLimit.max,
    message: authConfig.rateLimit.message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logSecurity('Rate Limit Exceeded', {
        ip: req.ip,
        path: req.path,
        headers: req.headers,
      });
      res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(options.windowMs ? options.windowMs / 1000 : 900),
      });
    },
    ...options,
  });
};

// General API rate limiter
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Stricter rate limiter for authentication routes
export const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again after an hour',
});

// Rate limiter for user registration
export const registrationLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 3 registration attempts per day
  message: 'Too many accounts created from this IP, please try again after 24 hours',
});

// Rate limiter for password reset requests
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again after an hour',
});

// Rate limiter for API endpoints that handle file uploads
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 file uploads per hour
  message: 'Too many file uploads, please try again after an hour',
});

// Rate limiter for public API endpoints
export const publicApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per 15 minutes
});

// Rate limiter for webhook endpoints
export const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 webhook calls per minute
});

// Configurable rate limiter creator for specific routes
export const createCustomRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return createRateLimiter({
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

    createRateLimiter({
      windowMs: config.windowMs,
      max: config.max,
      message: `Rate limit exceeded for ${userRole} role`,
    })(req, res, next);
  };
}; 