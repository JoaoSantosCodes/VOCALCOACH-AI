import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  userId: Schema.Types.ObjectId;
  exerciseId: Schema.Types.ObjectId;
  attempts: {
    startTime: Date;
    endTime: Date;
    duration: number;
    score: number;
    notes: {
      note: string;
      octave: number;
      accuracy: number;
      timing: number;
      pitch: number;
      volume: number;
    }[];
    feedback: {
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
    };
    metrics: {
      averagePitch: number;
      pitchStability: number;
      rhythmAccuracy: number;
      breathControl: number;
      overallScore: number;
    };
    recording?: {
      url: string;
      duration: number;
      format: string;
    };
  }[];
  bestScore: number;
  averageScore: number;
  totalAttempts: number;
  totalPracticeTime: number;
  lastPracticed: Date;
  isCompleted: boolean;
  completedAt?: Date;
  streak: number;
  lastStreak: Date;
  personalBests: {
    score: number;
    date: Date;
    attemptIndex: number;
  }[];
  notes: string[];
  goals: {
    type: string;
    target: number;
    current: number;
    deadline?: Date;
    isAchieved: boolean;
    achievedAt?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'VocalExercise',
      required: [true, 'Exercise ID is required'],
    },
    attempts: [
      {
        startTime: {
          type: Date,
          required: [true, 'Start time is required'],
        },
        endTime: {
          type: Date,
          required: [true, 'End time is required'],
        },
        duration: {
          type: Number,
          required: [true, 'Duration is required'],
          min: [0, 'Duration must be positive'],
        },
        score: {
          type: Number,
          required: [true, 'Score is required'],
          min: [0, 'Score must be between 0 and 100'],
          max: [100, 'Score must be between 0 and 100'],
        },
        notes: [
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
            accuracy: {
              type: Number,
              required: [true, 'Accuracy is required'],
              min: [0, 'Accuracy must be between 0 and 100'],
              max: [100, 'Accuracy must be between 0 and 100'],
            },
            timing: {
              type: Number,
              required: [true, 'Timing is required'],
              min: [0, 'Timing must be between 0 and 100'],
              max: [100, 'Timing must be between 0 and 100'],
            },
            pitch: {
              type: Number,
              required: [true, 'Pitch is required'],
              min: [0, 'Pitch must be between 0 and 100'],
              max: [100, 'Pitch must be between 0 and 100'],
            },
            volume: {
              type: Number,
              required: [true, 'Volume is required'],
              min: [0, 'Volume must be between 0 and 100'],
              max: [100, 'Volume must be between 0 and 100'],
            },
          },
        ],
        feedback: {
          strengths: [String],
          weaknesses: [String],
          suggestions: [String],
        },
        metrics: {
          averagePitch: {
            type: Number,
            required: [true, 'Average pitch is required'],
            min: [0, 'Average pitch must be between 0 and 100'],
            max: [100, 'Average pitch must be between 0 and 100'],
          },
          pitchStability: {
            type: Number,
            required: [true, 'Pitch stability is required'],
            min: [0, 'Pitch stability must be between 0 and 100'],
            max: [100, 'Pitch stability must be between 0 and 100'],
          },
          rhythmAccuracy: {
            type: Number,
            required: [true, 'Rhythm accuracy is required'],
            min: [0, 'Rhythm accuracy must be between 0 and 100'],
            max: [100, 'Rhythm accuracy must be between 0 and 100'],
          },
          breathControl: {
            type: Number,
            required: [true, 'Breath control is required'],
            min: [0, 'Breath control must be between 0 and 100'],
            max: [100, 'Breath control must be between 0 and 100'],
          },
          overallScore: {
            type: Number,
            required: [true, 'Overall score is required'],
            min: [0, 'Overall score must be between 0 and 100'],
            max: [100, 'Overall score must be between 0 and 100'],
          },
        },
        recording: {
          url: String,
          duration: Number,
          format: String,
        },
      },
    ],
    bestScore: {
      type: Number,
      default: 0,
      min: [0, 'Best score must be between 0 and 100'],
      max: [100, 'Best score must be between 0 and 100'],
    },
    averageScore: {
      type: Number,
      default: 0,
      min: [0, 'Average score must be between 0 and 100'],
      max: [100, 'Average score must be between 0 and 100'],
    },
    totalAttempts: {
      type: Number,
      default: 0,
      min: [0, 'Total attempts must be positive'],
    },
    totalPracticeTime: {
      type: Number,
      default: 0,
      min: [0, 'Total practice time must be positive'],
    },
    lastPracticed: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    streak: {
      type: Number,
      default: 0,
      min: [0, 'Streak must be positive'],
    },
    lastStreak: {
      type: Date,
      default: null,
    },
    personalBests: [
      {
        score: {
          type: Number,
          required: [true, 'Score is required'],
          min: [0, 'Score must be between 0 and 100'],
          max: [100, 'Score must be between 0 and 100'],
        },
        date: {
          type: Date,
          required: [true, 'Date is required'],
        },
        attemptIndex: {
          type: Number,
          required: [true, 'Attempt index is required'],
          min: [0, 'Attempt index must be positive'],
        },
      },
    ],
    notes: [String],
    goals: [
      {
        type: {
          type: String,
          required: [true, 'Goal type is required'],
        },
        target: {
          type: Number,
          required: [true, 'Target value is required'],
          min: [0, 'Target must be positive'],
        },
        current: {
          type: Number,
          default: 0,
          min: [0, 'Current value must be positive'],
        },
        deadline: Date,
        isAchieved: {
          type: Boolean,
          default: false,
        },
        achievedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índices
userProgressSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, lastPracticed: -1 });
userProgressSchema.index({ userId: 1, bestScore: -1 });
userProgressSchema.index({ userId: 1, isCompleted: 1 });
userProgressSchema.index({ userId: 1, streak: -1 });

// Virtuals
userProgressSchema.virtual('improvementRate').get(function () {
  if (this.attempts.length < 2) return 0;
  const firstScore = this.attempts[0].score;
  const lastScore = this.attempts[this.attempts.length - 1].score;
  return ((lastScore - firstScore) / firstScore) * 100;
});

userProgressSchema.virtual('averageAttemptDuration').get(function () {
  if (this.attempts.length === 0) return 0;
  const totalDuration = this.attempts.reduce(
    (sum, attempt) => sum + attempt.duration,
    0
  );
  return totalDuration / this.attempts.length;
});

// Métodos
userProgressSchema.methods.addAttempt = async function (
  attemptData: any
): Promise<void> {
  this.attempts.push(attemptData);
  this.totalAttempts += 1;
  this.totalPracticeTime += attemptData.duration;
  this.lastPracticed = attemptData.endTime;

  // Update scores
  if (attemptData.score > this.bestScore) {
    this.bestScore = attemptData.score;
    this.personalBests.push({
      score: attemptData.score,
      date: attemptData.endTime,
      attemptIndex: this.attempts.length - 1,
    });
  }

  const totalScore = this.attempts.reduce(
    (sum, attempt) => sum + attempt.score,
    0
  );
  this.averageScore = totalScore / this.attempts.length;

  // Update streak
  const now = new Date();
  const lastStreakDate = this.lastStreak || new Date(0);
  const daysDiff = Math.floor(
    (now.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 1) {
    this.streak += 1;
  } else if (daysDiff > 1) {
    this.streak = 1;
  }
  this.lastStreak = now;

  // Check completion
  if (attemptData.score >= 90 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = now;
  }

  await this.save();
};

userProgressSchema.methods.addGoal = async function (
  goalData: any
): Promise<void> {
  this.goals.push(goalData);
  await this.save();
};

userProgressSchema.methods.updateGoal = async function (
  goalId: string,
  progress: number
): Promise<void> {
  const goal = this.goals.id(goalId);
  if (!goal) throw new Error('Goal not found');

  goal.current = progress;
  if (progress >= goal.target && !goal.isAchieved) {
    goal.isAchieved = true;
    goal.achievedAt = new Date();
  }

  await this.save();
};

// Configuração do modelo
userProgressSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const UserProgress = mongoose.model<IUserProgress>(
  'UserProgress',
  userProgressSchema
);

export default UserProgress; 