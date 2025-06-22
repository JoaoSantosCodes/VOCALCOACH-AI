import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { User, IUser } from '../models/User';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';

export class TwoFactorService {
  private static readonly APP_NAME = 'VocalCoach AI';

  // Gera segredo e QR code para 2FA
  static async generateTwoFactorSecret(user: IUser) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      this.APP_NAME,
      secret
    );

    // Gera QR code
    const qrCode = await QRCode.toDataURL(otpauth);

    // Hash do segredo antes de salvar
    const hashedSecret = createHash('sha256').update(secret).digest('hex');

    // Atualiza usuário com o segredo
    await User.findByIdAndUpdate(user._id, {
      twoFactorSecret: hashedSecret,
      twoFactorEnabled: false,
    });

    return {
      secret,
      qrCode,
    };
  }

  // Verifica token 2FA
  static async verifyTwoFactorToken(
    userId: string,
    token: string
  ): Promise<boolean> {
    const user = await User.findById(userId).select('twoFactorSecret twoFactorEnabled');
    const userObj = user as any;
    if (!userObj || !userObj.twoFactorSecret) {
      return false;
    }
    const secret = userObj.twoFactorSecret;

    try {
      return authenticator.verify({
        token,
        secret,
      });
    } catch {
      return false;
    }
  }

  // Ativa 2FA para um usuário
  static async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    const isValid = await this.verifyTwoFactorToken(userId, token);

    if (!isValid) {
      return false;
    }

    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: true,
    });

    return true;
  }

  // Desativa 2FA para um usuário
  static async disableTwoFactor(
    userId: string,
    token: string
  ): Promise<boolean> {
    const isValid = await this.verifyTwoFactorToken(userId, token);

    if (!isValid) {
      return false;
    }

    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    return true;
  }

  // Gera códigos de backup
  static async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );

    // Hash dos códigos antes de salvar
    const hashedCodes = codes.map(code =>
      createHash('sha256').update(code).digest('hex')
    );

    await User.findByIdAndUpdate(userId, {
      backupCodes: hashedCodes,
    });

    return codes;
  }

  // Verifica código de backup
  static async verifyBackupCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    const user = await User.findById(userId).select('backupCodes');
    const userObj = user as any;
    if (!userObj || !userObj.backupCodes) {
      return false;
    }

    const hashedCode = createHash('sha256').update(code).digest('hex');
    const isValid = userObj.backupCodes.includes(hashedCode);

    if (isValid) {
      // Remove o código usado
      const remainingCodes = userObj.backupCodes.filter((c: string) => c !== hashedCode);
      await User.findByIdAndUpdate(userId, {
        backupCodes: remainingCodes,
      });
    }

    return isValid;
  }
} 