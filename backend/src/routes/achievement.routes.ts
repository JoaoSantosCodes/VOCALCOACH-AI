import { Router } from 'express';
import { AchievementController } from '../controllers/achievement.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Rotas de conquistas
router.get('/', authMiddleware, AchievementController.getUserAchievements);
router.get('/all', AchievementController.getAllAchievements);
router.post('/unlock', authMiddleware, AchievementController.unlockAchievement);
router.post('/check', authMiddleware, AchievementController.checkAchievements);
router.get('/stats', authMiddleware, AchievementController.getAchievementStats);

export default router; 