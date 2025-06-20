import { Router } from 'express';
import {
  getLatestPosts,
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/blog.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/latest', getLatestPosts);
router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

// Admin routes
router.post('/', authenticateToken, isAdmin, createPost);
router.put('/:id', authenticateToken, isAdmin, updatePost);
router.delete('/:id', authenticateToken, isAdmin, deletePost);

export default router; 