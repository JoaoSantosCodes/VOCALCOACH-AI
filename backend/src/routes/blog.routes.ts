import { Router, Request, Response } from 'express';
import {
  getLatestPosts,
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/blog.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';
import { RequestHandler } from 'express';

const router: Router = Router();

// Public routes
router.get('/latest', getLatestPosts);
router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

// Admin routes
router.post('/', authenticateToken, isAdmin, createPost as RequestHandler);
router.put('/:id', authenticateToken, isAdmin, updatePost);
router.delete('/:id', authenticateToken, isAdmin, deletePost);

export default router; 