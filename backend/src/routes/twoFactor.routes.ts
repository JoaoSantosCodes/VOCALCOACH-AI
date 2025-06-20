import { Router } from 'express';
import { TwoFactorController } from '../controllers/twoFactor.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';
import { TwoFactorSetupDto, TwoFactorVerifyDto, BackupCodeVerifyDto } from '../validators/twoFactor.validator';
import { securityAuditMiddleware } from '../middleware/audit.middleware';

const router = Router();

// Todas as rotas 2FA requerem autenticação
router.use(authMiddleware);
router.use(securityAuditMiddleware);

// Configuração inicial do 2FA
router.post('/setup', TwoFactorController.setup);

// Ativar 2FA
router.post(
  '/enable',
  validateRequest(TwoFactorSetupDto),
  TwoFactorController.enable
);

// Desativar 2FA
router.post(
  '/disable',
  validateRequest(TwoFactorVerifyDto),
  TwoFactorController.disable
);

// Verificar token 2FA
router.post(
  '/verify',
  validateRequest(TwoFactorVerifyDto),
  TwoFactorController.verify
);

// Verificar código de backup
router.post(
  '/verify-backup',
  validateRequest(BackupCodeVerifyDto),
  TwoFactorController.verifyBackup
);

// Gerar novos códigos de backup
router.post('/backup-codes', TwoFactorController.generateBackupCodes);

export default router; 