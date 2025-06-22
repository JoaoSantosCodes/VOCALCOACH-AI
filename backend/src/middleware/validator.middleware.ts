import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logError } from '../config/logger';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logError('Validation Error', error as Error);
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
        });
        return;
      }
      
      logError('Unexpected Validation Error', error as Error);
      res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  };
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
): void => {
  const contentType = req.get('content-type');
  
  if (!contentType) {
    res.status(400).json({
      error: 'Content-Type header is required'
    });
    return;
  }

  const isValidType = allowedTypes.some(type => contentType.includes(type));
  
  if (!isValidType) {
    res.status(400).json({
      error: `Content-Type must be one of: ${allowedTypes.join(', ')}`
    });
    return;
  }

  next();
};

export const validateQueryParams = (allowedParams: string[]) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const invalidParams = Object.keys(req.query).filter(param => !allowedParams.includes(param));
  
  if (invalidParams.length > 0) {
    res.status(400).json({
      error: `Invalid query parameters: ${invalidParams.join(', ')}`
    });
    return;
  }

  next();
};

export const validateFileSize = (maxSize: number) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = parseInt(req.get('content-length') || '0');
  
  if (contentLength > maxSize) {
    res.status(413).json({
      error: `File size exceeds maximum allowed size of ${maxSize} bytes`
    });
    return;
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
): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({
      error: 'Authorization token is required'
    });
    return;
  }

  // Aqui você pode adicionar validação adicional do token se necessário
  next();
}; 