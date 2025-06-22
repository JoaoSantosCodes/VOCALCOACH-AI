import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Rotas de estatísticas
router.get('/', authMiddleware, StatsController.getGeneralStats);
router.post('/update', authMiddleware, StatsController.updateStats);
router.get('/detailed', authMiddleware, StatsController.getDetailedStats);
router.get('/leaderboard', StatsController.getLeaderboard);
router.post('/reset/:userId', authMiddleware, StatsController.resetStats);

export default router; 