import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authConfig } from '../config/auth.config';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({ message: 'Autenticação falhou' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );

    // Redirecionar para o frontend com o token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`);
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    res.status(500).json({ message: 'Erro na autenticação com Google' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Set by auth middleware
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
}; 