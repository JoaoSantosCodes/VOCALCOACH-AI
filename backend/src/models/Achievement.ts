import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  icon: string;
  category: 'practice' | 'performance' | 'social' | 'special';
  type: 'one-time' | 'progressive' | 'streak' | 'milestone';
  requirements: {
    type: string;
    value: number;
    currentValue?: number;
  };
  rewards: {
    type: 'points' | 'badge' | 'feature' | 'title';
    value: number | string;
    description: string;
  }[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isSecret: boolean;
  isActive: boolean;
  progressTrackable: boolean;
  progressResetPeriod?: 'daily' | 'weekly' | 'monthly' | 'never';
  unlockCondition: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    name: {
      type: String,
      required: [true, 'Achievement name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Achievement icon is required'],
    },
    category: {
      type: String,
      enum: ['practice', 'performance', 'social', 'special'],
      required: [true, 'Achievement category is required'],
    },
    type: {
      type: String,
      enum: ['one-time', 'progressive', 'streak', 'milestone'],
      required: [true, 'Achievement type is required'],
    },
    requirements: {
      type: {
        type: String,
        required: [true, 'Requirement type is required'],
      },
      value: {
        type: Number,
        required: [true, 'Requirement value is required'],
      },
      currentValue: {
        type: Number,
        default: 0,
      },
    },
    rewards: [
      {
        type: {
          type: String,
          enum: ['points', 'badge', 'feature', 'title'],
          required: [true, 'Reward type is required'],
        },
        value: {
          type: Schema.Types.Mixed,
          required: [true, 'Reward value is required'],
        },
        description: {
          type: String,
          required: [true, 'Reward description is required'],
        },
      },
    ],
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      required: [true, 'Achievement rarity is required'],
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    progressTrackable: {
      type: Boolean,
      default: true,
    },
    progressResetPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'never',
    },
    unlockCondition: {
      type: String,
      required: [true, 'Unlock condition is required'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
achievementSchema.index({ category: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ rarity: 1 });
achievementSchema.index({ displayOrder: 1 });
achievementSchema.index({ isActive: 1 });

// Virtuals
achievementSchema.virtual('isProgressive').get(function () {
  return this.type === 'progressive';
});

achievementSchema.virtual('isStreak').get(function () {
  return this.type === 'streak';
});

achievementSchema.virtual('isMilestone').get(function () {
  return this.type === 'milestone';
});

achievementSchema.virtual('totalPoints').get(function () {
  return this.rewards
    .filter((reward) => reward.type === 'points')
    .reduce((total, reward) => total + (reward.value as number), 0);
});

// Métodos
achievementSchema.methods.isUnlocked = function (userProgress: number): boolean {
  return userProgress >= this.requirements.value;
};

achievementSchema.methods.calculateProgress = function (
  userProgress: number
): number {
  if (!this.progressTrackable) return 0;
  const progress = (userProgress / this.requirements.value) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

achievementSchema.methods.shouldResetProgress = function (
  lastResetDate: Date
): boolean {
  if (!this.progressResetPeriod || this.progressResetPeriod === 'never') {
    return false;
  }

  const now = new Date();
  const resetDate = new Date(lastResetDate);

  switch (this.progressResetPeriod) {
    case 'daily':
      return (
        now.getDate() !== resetDate.getDate() ||
        now.getMonth() !== resetDate.getMonth() ||
        now.getFullYear() !== resetDate.getFullYear()
      );
    case 'weekly':
      const weekDiff = Math.floor(
        (now.getTime() - resetDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      return weekDiff >= 1;
    case 'monthly':
      return (
        now.getMonth() !== resetDate.getMonth() ||
        now.getFullYear() !== resetDate.getFullYear()
      );
    default:
      return false;
  }
};

// Configuração do modelo
achievementSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Achievement = mongoose.model<IAchievement>(
  'Achievement',
  achievementSchema
);

export default Achievement; 