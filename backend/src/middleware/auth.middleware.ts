import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User, IUser } from '../models/User';

// Interface para request autenticado
interface AuthenticatedRequest extends Request {
  user?: IUser & { _id: string };
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

      (req as AuthenticatedRequest).user = user;
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
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!roles.includes(user.role || '')) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    return next();
  };
};

export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
    return;
  }

  if (!user.isEmailVerified) {
    res.status(403).json({
      status: 'error',
      message: 'Email verification required',
    });
    return;
  }

  next();
};

export const requireActiveSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
    return;
  }

  const hasActiveSubscription = user.subscription?.status === 'active' && 
    user.subscription?.endDate > new Date();

  if (!hasActiveSubscription) {
    res.status(403).json({
      status: 'error',
      message: 'Active subscription required',
    });
    return;
  }

  next();
};

export const requireCompleteProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
    return;
  }

  if (!user.isProfileComplete) {
    res.status(403).json({
      status: 'error',
      message: 'Complete profile required',
    });
    return;
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
): void => {
  if (!req.session || !req.session.id) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid session',
    });
    return;
  }

  // Check if session is expired
  if (req.session.cookie.expires && req.session.cookie.expires < new Date()) {
    res.status(401).json({
      status: 'error',
      message: 'Session expired',
    });
    return;
  }

  next();
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    res.status(400).json({
      status: 'error',
      message: 'Refresh token is required',
    });
    return;
  }

  try {
    const decoded = AuthService.verifyToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
      return;
    }

    const accessToken = AuthService.generateToken(user);

    res.json({
      status: 'success',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Refresh token expired',
    });
    return;
  }
};

// Alias para compatibilidade
export const authenticateToken = authMiddleware;

// Middleware para verificar se é admin
export const isAdmin = roleMiddleware(['admin']); 