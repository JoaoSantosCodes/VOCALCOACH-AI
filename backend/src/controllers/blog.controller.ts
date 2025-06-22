import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';

// Interface para o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

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
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
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
      posts: posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        author: post.author,
        publishedAt: post.publishedAt,
        tags: post.tags
      })),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Get single blog post by slug
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ slug, status: 'published' })
      .populate('author', 'name email');

    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }

    res.json({
      post: {
        id: post._id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        publishedAt: post.publishedAt,
        tags: post.tags,
        readTime: post.readTime
      }
    });
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Create new blog post (admin only)
export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { title, content, excerpt, tags } = req.body;

    // Gerar slug do título
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const post = new BlogPost({
      title,
      slug,
      content,
      excerpt,
      tags: tags || [],
      author: req.user._id,
      published: false
    });

    await post.save();

    res.status(201).json({
      message: 'Post criado com sucesso',
      post: {
        id: post._id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        published: post.publishedAt,
        tags: post.tags
      }
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update blog post (admin only)
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, tags, published } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }

    // Atualizar campos
    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (tags) post.tags = tags;
    if (published !== undefined) {
      if (published) {
        post.publishedAt = new Date();
      }
    }

    await post.save();

    res.json({
      message: 'Post atualizado com sucesso',
      post: {
        id: post._id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        publishedAt: post.publishedAt,
        tags: post.tags
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Delete blog post (admin only)
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }

    res.json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 