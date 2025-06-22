import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import logger from '../config/logger';
import { AuthService } from '../services/auth.service';
import { validateRegister, validateLogin } from '../validators/auth.validator';

// Interface para o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Registrar novo usuário
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = validateRegister(req.body);
    if (!validationResult) {
      res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
      });
      return;
    }

    const { email, password, name } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        status: 'error',
        message: 'Email já cadastrado',
      });
      return;
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar novo usuário
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'user',
      isEmailVerified: false,
      isProfileComplete: false,
    });

    await user.save();

    // Gerar token
    const token = AuthService.generateToken(user._id);

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
    });

    res.status(201).json({
      status: 'success',
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isProfileComplete: user.isProfileComplete,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = validateLogin(req.body);
    if (!validationResult) {
      res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
      });
      return;
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
      return;
    }

    // Verificar se a senha existe
    if (!user.password) {
      res.status(401).json({
        error: 'Email ou senha incorretos'
      });
      return;
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
      return;
    }

    // Gerar token
    const token = AuthService.generateToken(user._id);

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
    });

    res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isProfileComplete: user.isProfileComplete,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Login error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
};

// Atualizar token
export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Token inválido'
      });
      return;
    }

    // Gerar novo token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Token atualizado com sucesso',
      token,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar token:', error as Error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Logout
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Em uma implementação real, você pode invalidar o token
    // Por exemplo, adicionando-o a uma blacklist no Redis
    
    logger.info('User logged out', {
      userId: (req as any).user?._id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    logger.error('Logout error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
};

// Perfil do usuário
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Token inválido'
      });
      return;
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({
        error: 'Usuário não encontrado'
      });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar perfil:', error as Error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Verificar token
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isProfileComplete: user.isProfileComplete,
        },
      },
    });
  } catch (error) {
    logger.error('Token verification error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
};

// Solicitar redefinição de senha
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      res.status(200).json({
        status: 'success',
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha',
      });
      return;
    }

    // Gerar token de redefinição
    const resetToken = AuthService.generateToken(user._id);
    
    // Salvar token no usuário
    user.resetPasswordToken = String(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // TODO: Enviar email com link de redefinição
    logger.info('Password reset requested', {
      userId: user._id,
      email: user.email,
    });

    res.status(200).json({
      status: 'success',
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha',
    });
  } catch (error) {
    logger.error('Forgot password error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
};

// Redefinir senha
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Buscar usuário com token válido
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        status: 'error',
        message: 'Token inválido ou expirado',
      });
      return;
    }

    // Atualizar senha
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info('Password reset successfully', {
      userId: user._id,
      email: user.email,
    });

    res.status(200).json({
      status: 'success',
      message: 'Senha redefinida com sucesso',
    });
  } catch (error) {
    logger.error('Reset password error', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
}; 