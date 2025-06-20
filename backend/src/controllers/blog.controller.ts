import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';

// Get latest blog posts for home page
export const getLatestPosts = async (req: Request, res: Response) => {
  try {
    const posts = await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(3)
      .populate('author', 'name');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error });
  }
};

// Get all published blog posts with pagination
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const category = req.query.category as string;
    const tag = req.query.tag as string;

    const query: any = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name');

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error });
  }
};

// Get single blog post by slug
export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog post', error });
  }
};

// Create new blog post (admin only)
export const createPost = async (req: Request, res: Response) => {
  try {
    const post = new BlogPost({
      ...req.body,
      author: req.user.id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog post', error });
  }
};

// Update blog post (admin only)
export const updatePost = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog post', error });
  }
};

// Delete blog post (admin only)
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog post', error });
  }
}; 