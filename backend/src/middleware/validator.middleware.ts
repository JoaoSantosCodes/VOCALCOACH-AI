import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logError } from '../config/logger';

export const validate = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      logError(error, 'Validation Error');
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      });
    }
    logError(error as Error, 'Unexpected Validation Error');
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during validation',
    });
  }
};

export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove any potentially dangerous HTML/script tags
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

export const sanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);
  next();
};

export const validateContentType = (allowedTypes: string[]) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const contentType = req.headers['content-type'];
  if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
    return res.status(415).json({
      status: 'error',
      message: `Unsupported Media Type. Allowed types: ${allowedTypes.join(', ')}`,
    });
  }
  next();
};

export const validateQueryParams = (allowedParams: string[]) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const invalidParams = Object.keys(req.query).filter(
    param => !allowedParams.includes(param)
  );

  if (invalidParams.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid query parameters',
      invalidParams,
    });
  }
  next();
};

export const validateFileSize = (maxSize: number) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers['content-length']) {
    return res.status(411).json({
      status: 'error',
      message: 'Content-Length header is required',
    });
  }

  const contentLength = parseInt(req.headers['content-length'], 10);
  if (contentLength > maxSize) {
    return res.status(413).json({
      status: 'error',
      message: `File too large. Maximum size allowed is ${maxSize} bytes`,
    });
  }
  next();
};

export const validateRequestSize = (maxSize: number) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let data = '';
  
  req.on('data', chunk => {
    data += chunk;
    if (data.length > maxSize) {
      res.status(413).json({
        status: 'error',
        message: `Request entity too large. Maximum size allowed is ${maxSize} bytes`,
      });
      req.destroy();
    }
  });

  req.on('end', () => {
    next();
  });
};

export const validateAuthToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'No authorization token provided',
    });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authorization header format',
    });
  }

  // Token validation logic will be handled by auth middleware
  next();
}; 