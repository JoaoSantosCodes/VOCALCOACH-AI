import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { authConfig } from '../config/auth.config';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'premium' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  google?: {
    id: string;
    accessToken: string;
    refreshToken: string;
  };
  facebook?: {
    id: string;
    accessToken: string;
    refreshToken: string;
  };
  apple?: {
    id: string;
    accessToken: string;
    refreshToken: string;
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  stats: {
    totalPracticeTime: number;
    lessonsCompleted: number;
    averageScore: number;
    streak: number;
    lastPractice: Date;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
  }[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): Promise<string>;
  generateEmailVerificationToken(): Promise<string>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'premium', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    google: {
      id: String,
      accessToken: String,
      refreshToken: String,
    },
    facebook: {
      id: String,
      accessToken: String,
      refreshToken: String,
    },
    apple: {
      id: String,
      accessToken: String,
      refreshToken: String,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active',
      },
      startDate: Date,
      endDate: Date,
      autoRenew: {
        type: Boolean,
        default: true,
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      language: {
        type: String,
        default: 'en',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
    },
    stats: {
      totalPracticeTime: {
        type: Number,
        default: 0,
      },
      lessonsCompleted: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      streak: {
        type: Number,
        default: 0,
      },
      lastPractice: {
        type: Date,
        default: null,
      },
    },
    achievements: [
      {
        id: String,
        name: String,
        description: String,
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Índices
userSchema.index({ email: 1 });
userSchema.index({ 'google.id': 1 });
userSchema.index({ 'facebook.id': 1 });
userSchema.index({ 'apple.id': 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ 'stats.streak': -1 });
userSchema.index({ 'stats.averageScore': -1 });

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(authConfig.security.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password!);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Método para gerar token de redefinição de senha
userSchema.methods.generatePasswordResetToken = async function (): Promise<string> {
  const token = await bcrypt.hash(Math.random().toString(), 8);
  this.resetPasswordToken = token;
  this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
  await this.save();
  return token;
};

// Método para gerar token de verificação de email
userSchema.methods.generateEmailVerificationToken = async function (): Promise<string> {
  const token = await bcrypt.hash(Math.random().toString(), 8);
  this.verificationToken = token;
  this.verificationTokenExpires = new Date(Date.now() + 24 * 3600000); // 24 horas
  await this.save();
  return token;
};

// Virtuals
userSchema.virtual('hasActiveSubscription').get(function () {
  return (
    this.subscription?.status === 'active' &&
    this.subscription?.endDate > new Date()
  );
});

userSchema.virtual('isPasswordSet').get(function () {
  return Boolean(this.password);
});

userSchema.virtual('fullName').get(function () {
  return this.name;
});

// Configuração do modelo
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.verificationToken;
    delete ret.verificationTokenExpires;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);

export default User; 