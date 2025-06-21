import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { config } from '../config/auth.config';

export class AuthService {
  private static readonly TOKEN_EXPIRATION = '24h';
  private static readonly REFRESH_TOKEN_EXPIRATION = '7d';

  /**
   * Gera um token JWT para o usuário
   */
  static generateToken(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: this.TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.refreshTokenSecret,
      { expiresIn: this.REFRESH_TOKEN_EXPIRATION }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verifica se uma senha está correta
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Hash a senha
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Verifica e decodifica um refresh token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, config.refreshTokenSecret);
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Gera um novo access token usando um refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    const decoded = this.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: this.TOKEN_EXPIRATION }
    );
  }
} 