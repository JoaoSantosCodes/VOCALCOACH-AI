import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  author: Schema.Types.ObjectId;
  slug: string;
  tags: string[];
  score: number;
  criteria: {
    type: string;
    value: number;
  };
  progress: number;
  publishedAt: Date;
  status: 'draft' | 'published';
  views: number;
}

const BlogPostSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  readTime: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  views: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  criteria: {
    type: {
      type: String,
      default: 'views',
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  progress: {
    type: Number,
    default: 0,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

// Middleware para gerar o slug antes de salvar
BlogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema); 