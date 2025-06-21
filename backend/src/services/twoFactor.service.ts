import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { User } from '../models/User';
import { prisma } from '../config/database';
import { createHash } from 'crypto';

export class TwoFactorService {
  private static readonly APP_NAME = 'VocalCoach AI';

  // Gera segredo e QR code para 2FA
  static async generateTwoFactorSecret(user: User) {
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
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: hashedSecret,
        twoFactorEnabled: false,
      },
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.twoFactorSecret) {
      return false;
    }

    // Recupera o segredo original
    const secret = user.twoFactorSecret;

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

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: hashedCodes,
      },
    });

    return codes;
  }

  // Verifica código de backup
  static async verifyBackupCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        backupCodes: true,
      },
    });

    if (!user || !user.backupCodes) {
      return false;
    }

    const hashedCode = createHash('sha256').update(code).digest('hex');
    const isValid = user.backupCodes.includes(hashedCode);

    if (isValid) {
      // Remove o código usado
      const remainingCodes = user.backupCodes.filter(c => c !== hashedCode);
      await prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: remainingCodes,
        },
      });
    }

    return isValid;
  }
} 