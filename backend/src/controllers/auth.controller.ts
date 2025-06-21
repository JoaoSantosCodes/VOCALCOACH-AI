import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';
import { logger } from '../config/logger';

export class AuthController {
  /**
   * Login de usuário
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isValidPassword = await AuthService.verifyPassword(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const { accessToken, refreshToken } = AuthService.generateToken(user);

      // Remove a senha antes de enviar
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.json({
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      logger.error('Erro no login:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Registro de novo usuário
   */
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }

      const hashedPassword = await AuthService.hashPassword(password);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
      });

      const { accessToken, refreshToken } = AuthService.generateToken(user);

      // Remove a senha antes de enviar
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json({
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      logger.error('Erro no registro:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Atualiza o token de acesso usando um refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token não fornecido' });
      }

      const accessToken = await AuthService.refreshAccessToken(refreshToken);

      return res.json({ accessToken });
    } catch (error) {
      logger.error('Erro ao atualizar token:', error);
      return res.status(401).json({ message: 'Refresh token inválido' });
    }
  }

  /**
   * Retorna os dados do usuário atual
   */
  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Remove a senha antes de enviar
      const userResponse = req.user.toObject();
      delete userResponse.password;

      return res.json({ user: userResponse });
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
} 