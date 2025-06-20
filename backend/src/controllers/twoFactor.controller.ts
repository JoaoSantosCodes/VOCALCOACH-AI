import { Request, Response } from 'express';
import { TwoFactorService } from '../services/twoFactor.service';
import { validateOrReject } from 'class-validator';
import { TwoFactorSetupDto, TwoFactorVerifyDto } from '../validators/twoFactor.validator';

export class TwoFactorController {
  // Iniciar configuração 2FA
  static async setup(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { secret, qrCode } = await TwoFactorService.generateTwoFactorSecret(
        (req as any).user
      );

      return res.status(200).json({
        success: true,
        data: {
          secret,
          qrCode,
          message: 'Escaneie o código QR com seu aplicativo autenticador',
        },
      });
    } catch (error) {
      console.error('Erro ao configurar 2FA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao configurar autenticação de dois fatores',
      });
    }
  }

  // Ativar 2FA
  static async enable(req: Request, res: Response) {
    try {
      const dto = new TwoFactorSetupDto();
      Object.assign(dto, req.body);
      await validateOrReject(dto);

      const userId = (req as any).user.id;
      const success = await TwoFactorService.enableTwoFactor(
        userId,
        dto.token
      );

      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido',
        });
      }

      // Gera códigos de backup
      const backupCodes = await TwoFactorService.generateBackupCodes(userId);

      return res.status(200).json({
        success: true,
        data: {
          backupCodes,
          message: 'Autenticação de dois fatores ativada com sucesso',
        },
      });
    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao ativar autenticação de dois fatores',
      });
    }
  }

  // Desativar 2FA
  static async disable(req: Request, res: Response) {
    try {
      const dto = new TwoFactorVerifyDto();
      Object.assign(dto, req.body);
      await validateOrReject(dto);

      const userId = (req as any).user.id;
      const success = await TwoFactorService.disableTwoFactor(
        userId,
        dto.token
      );

      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Autenticação de dois fatores desativada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao desativar 2FA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao desativar autenticação de dois fatores',
      });
    }
  }

  // Verificar token 2FA
  static async verify(req: Request, res: Response) {
    try {
      const dto = new TwoFactorVerifyDto();
      Object.assign(dto, req.body);
      await validateOrReject(dto);

      const userId = (req as any).user.id;
      const isValid = await TwoFactorService.verifyTwoFactorToken(
        userId,
        dto.token
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token válido',
      });
    } catch (error) {
      console.error('Erro ao verificar token 2FA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar token',
      });
    }
  }

  // Verificar código de backup
  static async verifyBackup(req: Request, res: Response) {
    try {
      const { code } = req.body;
      const userId = (req as any).user.id;

      const isValid = await TwoFactorService.verifyBackupCode(userId, code);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Código de backup inválido',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Código de backup válido',
      });
    } catch (error) {
      console.error('Erro ao verificar código de backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar código de backup',
      });
    }
  }

  // Gerar novos códigos de backup
  static async generateBackupCodes(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const backupCodes = await TwoFactorService.generateBackupCodes(userId);

      return res.status(200).json({
        success: true,
        data: {
          backupCodes,
          message: 'Novos códigos de backup gerados com sucesso',
        },
      });
    } catch (error) {
      console.error('Erro ao gerar códigos de backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar novos códigos de backup',
      });
    }
  }
} 