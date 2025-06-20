import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';
import { logError, logSecurity } from '../config/logger';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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

    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      const user = await User.findById((decoded as any).id).select('-password');

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User account is inactive',
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired',
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token',
        });
      }
      throw error;
    }
  } catch (error) {
    logError(error as Error, 'Auth Middleware Error');
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication',
    });
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      logSecurity('Unauthorized Role Access', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
        path: req.path,
      });
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Email verification required',
    });
  }

  next();
};

export const requireActiveSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  if (!req.user.hasActiveSubscription) {
    return res.status(403).json({
      status: 'error',
      message: 'Active subscription required',
    });
  }

  next();
};

export const requireCompleteProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
  }

  if (!req.user.isProfileComplete) {
    return res.status(403).json({
      status: 'error',
      message: 'Complete profile required',
    });
  }

  next();
};

export const checkIpBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientIp = req.ip;

  try {
    // Implement IP blacklist check logic here
    // const isBlacklisted = await checkIfIpIsBlacklisted(clientIp);
    const isBlacklisted = false;

    if (isBlacklisted) {
      logSecurity('Blocked IP Access Attempt', {
        ip: clientIp,
        path: req.path,
      });
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }

    next();
  } catch (error) {
    logError(error as Error, 'IP Blacklist Check Error');
    next();
  }
};

export const validateSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !req.session.id) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid session',
    });
  }

  // Check if session is expired
  if (req.session.cookie.expires && req.session.cookie.expires < new Date()) {
    return res.status(401).json({
      status: 'error',
      message: 'Session expired',
    });
  }

  next();
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      status: 'error',
      message: 'Refresh token is required',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, authConfig.jwt.secret);
    const user = await User.findById((decoded as any).id).select('-password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );

    res.json({
      status: 'success',
      accessToken,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token expired',
      });
    }
    logError(error as Error, 'Refresh Token Error');
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during token refresh',
    });
  }
}; 