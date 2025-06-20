import { Router } from 'express';
import passport from 'passport';
import { register, login, getProfile, googleCallback } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

// Rotas de autenticação local
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Rotas de autenticação Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  googleCallback
);

router.get('/profile', authMiddleware, getProfile);

export default router; 