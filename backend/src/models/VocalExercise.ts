import mongoose, { Document, Schema } from 'mongoose';

export interface IVocalExercise extends Document {
  name: string;
  description: string;
  type: 'warmup' | 'technique' | 'song' | 'pitch' | 'rhythm' | 'breathing';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'range' | 'control' | 'power' | 'agility' | 'articulation';
  duration: number; // in seconds
  targetNotes: {
    note: string;
    octave: number;
    duration: number;
  }[];
  audioUrl: string;
  videoUrl?: string;
  sheetMusicUrl?: string;
  instructions: string[];
  tips: string[];
  prerequisites?: string[];
  benefits: string[];
  muscleGroups: string[];
  isPublic: boolean;
  isActive: boolean;
  requiresPremium: boolean;
  authorId: Schema.Types.ObjectId;
  tags: string[];
  metrics: {
    avgRating: number;
    totalRatings: number;
    completionRate: number;
    avgCompletionTime: number;
    difficulty: number;
  };
  progression: {
    previous?: Schema.Types.ObjectId;
    next?: Schema.Types.ObjectId;
    sequence: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const vocalExerciseSchema = new Schema<IVocalExercise>(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Exercise description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['warmup', 'technique', 'song', 'pitch', 'rhythm', 'breathing'],
      required: [true, 'Exercise type is required'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: [true, 'Exercise difficulty is required'],
    },
    category: {
      type: String,
      enum: ['range', 'control', 'power', 'agility', 'articulation'],
      required: [true, 'Exercise category is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Exercise duration is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    targetNotes: [
      {
        note: {
          type: String,
          required: [true, 'Note is required'],
          match: [/^[A-G][#b]?$/, 'Invalid note format'],
        },
        octave: {
          type: Number,
          required: [true, 'Octave is required'],
          min: [0, 'Octave must be between 0 and 8'],
          max: [8, 'Octave must be between 0 and 8'],
        },
        duration: {
          type: Number,
          required: [true, 'Note duration is required'],
          min: [0, 'Duration must be positive'],
        },
      },
    ],
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
      validate: {
        validator: (v: string) => /^https?:\/\/.+/.test(v),
        message: 'Invalid audio URL',
      },
    },
    videoUrl: {
      type: String,
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'Invalid video URL',
      },
    },
    sheetMusicUrl: {
      type: String,
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'Invalid sheet music URL',
      },
    },
    instructions: {
      type: [String],
      required: [true, 'Instructions are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one instruction is required',
      },
    },
    tips: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      required: [true, 'Benefits are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one benefit is required',
      },
    },
    muscleGroups: {
      type: [String],
      required: [true, 'Muscle groups are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one muscle group is required',
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    requiresPremium: {
      type: Boolean,
      default: false,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    metrics: {
      avgRating: {
        type: Number,
        default: 0,
        min: [0, 'Average rating must be between 0 and 5'],
        max: [5, 'Average rating must be between 0 and 5'],
      },
      totalRatings: {
        type: Number,
        default: 0,
        min: [0, 'Total ratings must be positive'],
      },
      completionRate: {
        type: Number,
        default: 0,
        min: [0, 'Completion rate must be between 0 and 100'],
        max: [100, 'Completion rate must be between 0 and 100'],
      },
      avgCompletionTime: {
        type: Number,
        default: 0,
        min: [0, 'Average completion time must be positive'],
      },
      difficulty: {
        type: Number,
        default: 0,
        min: [0, 'Difficulty must be between 0 and 10'],
        max: [10, 'Difficulty must be between 0 and 10'],
      },
    },
    progression: {
      previous: {
        type: Schema.Types.ObjectId,
        ref: 'VocalExercise',
      },
      next: {
        type: Schema.Types.ObjectId,
        ref: 'VocalExercise',
      },
      sequence: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices
vocalExerciseSchema.index({ name: 'text', description: 'text' });
vocalExerciseSchema.index({ type: 1 });
vocalExerciseSchema.index({ difficulty: 1 });
vocalExerciseSchema.index({ category: 1 });
vocalExerciseSchema.index({ isPublic: 1 });
vocalExerciseSchema.index({ isActive: 1 });
vocalExerciseSchema.index({ requiresPremium: 1 });
vocalExerciseSchema.index({ authorId: 1 });
vocalExerciseSchema.index({ tags: 1 });
vocalExerciseSchema.index({ 'metrics.avgRating': -1 });
vocalExerciseSchema.index({ 'progression.sequence': 1 });

// Virtuals
vocalExerciseSchema.virtual('durationFormatted').get(function () {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

vocalExerciseSchema.virtual('difficultyText').get(function () {
  const difficulty = this.metrics.difficulty;
  if (difficulty <= 3) return 'Easy';
  if (difficulty <= 6) return 'Medium';
  if (difficulty <= 8) return 'Hard';
  return 'Very Hard';
});

// Métodos
vocalExerciseSchema.methods.isAccessibleByUser = function (
  user: any
): boolean {
  if (!this.isActive) return false;
  if (this.isPublic && !this.requiresPremium) return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (this.requiresPremium && !user.hasActiveSubscription) return false;
  if (this.authorId.equals(user._id)) return true;
  return false;
};

vocalExerciseSchema.methods.updateMetrics = async function (
  rating: number,
  completionTime: number,
  completed: boolean
): Promise<void> {
  const oldTotalRatings = this.metrics.totalRatings;
  const oldAvgRating = this.metrics.avgRating;

  // Update rating metrics
  if (rating) {
    this.metrics.totalRatings += 1;
    this.metrics.avgRating =
      (oldAvgRating * oldTotalRatings + rating) / this.metrics.totalRatings;
  }

  // Update completion metrics
  if (completed) {
    const oldCompletions = this.metrics.completionRate * oldTotalRatings;
    this.metrics.completionRate =
      ((oldCompletions + (completed ? 1 : 0)) / this.metrics.totalRatings) * 100;
  }

  // Update completion time
  if (completionTime) {
    const oldTotalTime = this.metrics.avgCompletionTime * oldTotalRatings;
    this.metrics.avgCompletionTime =
      (oldTotalTime + completionTime) / this.metrics.totalRatings;
  }

  await this.save();
};

// Configuração do modelo
vocalExerciseSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const VocalExercise = mongoose.model<IVocalExercise>(
  'VocalExercise',
  vocalExerciseSchema
);

export default VocalExercise; 