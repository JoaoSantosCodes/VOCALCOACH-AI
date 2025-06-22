import { Router } from 'express';
import { VoiceController } from '../controllers/voice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Rotas de análise de voz
router.post('/analyze', authMiddleware, VoiceController.analyzeVoice);
router.get('/history', authMiddleware, VoiceController.getAnalysisHistory);
router.get('/:id', authMiddleware, VoiceController.getAnalysis);
router.delete('/:id', authMiddleware, VoiceController.deleteAnalysis);
router.get('/stats/voice', authMiddleware, VoiceController.getVoiceStats);

export default router; 