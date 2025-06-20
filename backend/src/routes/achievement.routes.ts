import { Router } from 'express';
import { getUserAchievements, checkAndUpdateAchievements, initializeUserAchievements } from '../controllers/achievement.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's achievements
router.get('/', getUserAchievements);

// Check and update achievements
router.post('/check', checkAndUpdateAchievements);

// Initialize achievements for new user
router.post('/initialize', initializeUserAchievements);

export default router; 