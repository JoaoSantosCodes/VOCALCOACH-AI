import { Router } from 'express';
import { startAnalysis, getAnalysisHistory, getAnalysisById } from '../controllers/voice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Voice analysis routes
router.post('/analyze', startAnalysis);
router.get('/history', getAnalysisHistory);
router.get('/:id', getAnalysisById);

export default router; 