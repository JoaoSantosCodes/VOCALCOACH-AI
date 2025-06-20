import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId: Schema.Types.ObjectId;
  exerciseId: Schema.Types.ObjectId;
  attemptId: Schema.Types.ObjectId;
  type: 'pitch' | 'rhythm' | 'breathing' | 'technique' | 'general';
  category: 'strength' | 'weakness' | 'suggestion';
  content: string;
  metrics: {
    pitchAccuracy: number;
    rhythmAccuracy: number;
    breathControl: number;
    overallScore: number;
    confidence: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    technicalNotes: string[];
  };
  audioMarkers: {
    timestamp: number;
    duration: number;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  visualData: {
    type: string;
    data: any;
    timestamp: number;
  }[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'addressed';
  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
  isAutomated: boolean;
  confidence: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
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
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProgress.attempts',
      required: [true, 'Attempt ID is required'],
    },
    type: {
      type: String,
      enum: ['pitch', 'rhythm', 'breathing', 'technique', 'general'],
      required: [true, 'Feedback type is required'],
    },
    category: {
      type: String,
      enum: ['strength', 'weakness', 'suggestion'],
      required: [true, 'Feedback category is required'],
    },
    content: {
      type: String,
      required: [true, 'Feedback content is required'],
      trim: true,
      maxlength: [1000, 'Content cannot exceed 1000 characters'],
    },
    metrics: {
      pitchAccuracy: {
        type: Number,
        required: [true, 'Pitch accuracy is required'],
        min: [0, 'Pitch accuracy must be between 0 and 100'],
        max: [100, 'Pitch accuracy must be between 0 and 100'],
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
      confidence: {
        type: Number,
        required: [true, 'Confidence score is required'],
        min: [0, 'Confidence must be between 0 and 100'],
        max: [100, 'Confidence must be between 0 and 100'],
      },
    },
    analysis: {
      strengths: {
        type: [String],
        default: [],
      },
      weaknesses: {
        type: [String],
        default: [],
      },
      suggestions: {
        type: [String],
        default: [],
      },
      technicalNotes: {
        type: [String],
        default: [],
      },
    },
    audioMarkers: [
      {
        timestamp: {
          type: Number,
          required: [true, 'Marker timestamp is required'],
          min: [0, 'Timestamp must be positive'],
        },
        duration: {
          type: Number,
          required: [true, 'Marker duration is required'],
          min: [0, 'Duration must be positive'],
        },
        type: {
          type: String,
          required: [true, 'Marker type is required'],
        },
        description: {
          type: String,
          required: [true, 'Marker description is required'],
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          required: [true, 'Marker severity is required'],
        },
      },
    ],
    visualData: [
      {
        type: {
          type: String,
          required: [true, 'Visual data type is required'],
        },
        data: {
          type: Schema.Types.Mixed,
          required: [true, 'Visual data is required'],
        },
        timestamp: {
          type: Number,
          required: [true, 'Visual data timestamp is required'],
          min: [0, 'Timestamp must be positive'],
        },
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'addressed'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    isAutomated: {
      type: Boolean,
      default: true,
    },
    confidence: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0, 'Confidence must be between 0 and 100'],
      max: [100, 'Confidence must be between 0 and 100'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Índices
feedbackSchema.index({ userId: 1, exerciseId: 1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ exerciseId: 1, type: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ isAutomated: 1 });
feedbackSchema.index({ tags: 1 });

// Virtuals
feedbackSchema.virtual('isHighPriority').get(function () {
  return this.priority === 'high';
});

feedbackSchema.virtual('needsReview').get(function () {
  return this.status === 'pending' && this.isAutomated;
});

feedbackSchema.virtual('age').get(function () {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Métodos
feedbackSchema.methods.markAsReviewed = async function (
  reviewerId: Schema.Types.ObjectId
): Promise<void> {
  this.status = 'reviewed';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  await this.save();
};

feedbackSchema.methods.markAsAddressed = async function (): Promise<void> {
  this.status = 'addressed';
  await this.save();
};

feedbackSchema.methods.addAudioMarker = async function (
  markerData: any
): Promise<void> {
  this.audioMarkers.push(markerData);
  await this.save();
};

feedbackSchema.methods.addVisualData = async function (
  visualData: any
): Promise<void> {
  this.visualData.push(visualData);
  await this.save();
};

feedbackSchema.methods.updateAnalysis = async function (
  analysisData: any
): Promise<void> {
  this.analysis = {
    ...this.analysis,
    ...analysisData,
  };
  await this.save();
};

// Configuração do modelo
feedbackSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);

export default Feedback; 