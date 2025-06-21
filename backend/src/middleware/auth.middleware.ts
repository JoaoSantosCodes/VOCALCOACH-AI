import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
      const decoded = AuthService.verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    return next();
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
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }

    next();
  } catch (error) {
    return next();
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
    const decoded = AuthService.verifyToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
    }

    const accessToken = AuthService.generateToken(user);

    res.json({
      status: 'success',
      accessToken,
    });
  } catch (error) {
    if (error instanceof AuthService.TokenExpiredError) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token expired',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during token refresh',
    });
  }
}; 