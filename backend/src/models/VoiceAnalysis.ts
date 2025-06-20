import mongoose, { Document, Schema } from 'mongoose';

export interface IVoiceAnalysis extends Document {
  userId: Schema.Types.ObjectId;
  exerciseId: Schema.Types.ObjectId;
  attemptId: Schema.Types.ObjectId;
  audioUrl: string;
  duration: number;
  format: string;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  fileSize: number;
  pitch: {
    average: number;
    min: number;
    max: number;
    stability: number;
    range: number;
    notes: {
      note: string;
      octave: number;
      frequency: number;
      timestamp: number;
      duration: number;
      accuracy: number;
    }[];
  };
  rhythm: {
    tempo: number;
    accuracy: number;
    stability: number;
    beats: {
      timestamp: number;
      type: string;
      intensity: number;
      duration: number;
    }[];
  };
  timbre: {
    brightness: number;
    warmth: number;
    roughness: number;
    breathiness: number;
    resonance: number;
    formants: {
      frequency: number;
      amplitude: number;
      bandwidth: number;
    }[];
  };
  dynamics: {
    average: number;
    min: number;
    max: number;
    range: number;
    variation: number;
    envelope: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    };
  };
  spectralAnalysis: {
    centroid: number;
    spread: number;
    skewness: number;
    kurtosis: number;
    flatness: number;
    rolloff: number;
    flux: number;
    harmonics: {
      frequency: number;
      amplitude: number;
      phase: number;
    }[];
  };
  breathing: {
    rate: number;
    depth: number;
    stability: number;
    support: number;
    markers: {
      type: string;
      timestamp: number;
      duration: number;
      intensity: number;
    }[];
  };
  articulation: {
    clarity: number;
    precision: number;
    consistency: number;
    phonemes: {
      type: string;
      timestamp: number;
      duration: number;
      accuracy: number;
    }[];
  };
  problems: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
    duration: number;
    description: string;
    suggestions: string[];
  }[];
  metrics: {
    overallScore: number;
    pitchScore: number;
    rhythmScore: number;
    timbreScore: number;
    dynamicsScore: number;
    breathingScore: number;
    articulationScore: number;
    confidence: number;
  };
  visualizations: {
    type: string;
    data: any;
    timestamp: number;
    duration: number;
  }[];
  processingTime: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  error?: {
    code: string;
    message: string;
    details: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const voiceAnalysisSchema = new Schema<IVoiceAnalysis>(
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
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
      validate: {
        validator: (v: string) => /^https?:\/\/.+/.test(v),
        message: 'Invalid audio URL',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration must be positive'],
    },
    format: {
      type: String,
      required: [true, 'Audio format is required'],
    },
    sampleRate: {
      type: Number,
      required: [true, 'Sample rate is required'],
      min: [0, 'Sample rate must be positive'],
    },
    channels: {
      type: Number,
      required: [true, 'Number of channels is required'],
      min: [1, 'Must have at least one channel'],
    },
    bitDepth: {
      type: Number,
      required: [true, 'Bit depth is required'],
      min: [0, 'Bit depth must be positive'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size must be positive'],
    },
    pitch: {
      average: {
        type: Number,
        required: [true, 'Average pitch is required'],
      },
      min: {
        type: Number,
        required: [true, 'Minimum pitch is required'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum pitch is required'],
      },
      stability: {
        type: Number,
        required: [true, 'Pitch stability is required'],
        min: [0, 'Stability must be between 0 and 100'],
        max: [100, 'Stability must be between 0 and 100'],
      },
      range: {
        type: Number,
        required: [true, 'Pitch range is required'],
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
          frequency: {
            type: Number,
            required: [true, 'Frequency is required'],
            min: [0, 'Frequency must be positive'],
          },
          timestamp: {
            type: Number,
            required: [true, 'Timestamp is required'],
            min: [0, 'Timestamp must be positive'],
          },
          duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [0, 'Duration must be positive'],
          },
          accuracy: {
            type: Number,
            required: [true, 'Accuracy is required'],
            min: [0, 'Accuracy must be between 0 and 100'],
            max: [100, 'Accuracy must be between 0 and 100'],
          },
        },
      ],
    },
    rhythm: {
      tempo: {
        type: Number,
        required: [true, 'Tempo is required'],
        min: [0, 'Tempo must be positive'],
      },
      accuracy: {
        type: Number,
        required: [true, 'Rhythm accuracy is required'],
        min: [0, 'Accuracy must be between 0 and 100'],
        max: [100, 'Accuracy must be between 0 and 100'],
      },
      stability: {
        type: Number,
        required: [true, 'Rhythm stability is required'],
        min: [0, 'Stability must be between 0 and 100'],
        max: [100, 'Stability must be between 0 and 100'],
      },
      beats: [
        {
          timestamp: {
            type: Number,
            required: [true, 'Beat timestamp is required'],
            min: [0, 'Timestamp must be positive'],
          },
          type: {
            type: String,
            required: [true, 'Beat type is required'],
          },
          intensity: {
            type: Number,
            required: [true, 'Beat intensity is required'],
            min: [0, 'Intensity must be between 0 and 100'],
            max: [100, 'Intensity must be between 0 and 100'],
          },
          duration: {
            type: Number,
            required: [true, 'Beat duration is required'],
            min: [0, 'Duration must be positive'],
          },
        },
      ],
    },
    timbre: {
      brightness: {
        type: Number,
        required: [true, 'Brightness is required'],
        min: [0, 'Brightness must be between 0 and 100'],
        max: [100, 'Brightness must be between 0 and 100'],
      },
      warmth: {
        type: Number,
        required: [true, 'Warmth is required'],
        min: [0, 'Warmth must be between 0 and 100'],
        max: [100, 'Warmth must be between 0 and 100'],
      },
      roughness: {
        type: Number,
        required: [true, 'Roughness is required'],
        min: [0, 'Roughness must be between 0 and 100'],
        max: [100, 'Roughness must be between 0 and 100'],
      },
      breathiness: {
        type: Number,
        required: [true, 'Breathiness is required'],
        min: [0, 'Breathiness must be between 0 and 100'],
        max: [100, 'Breathiness must be between 0 and 100'],
      },
      resonance: {
        type: Number,
        required: [true, 'Resonance is required'],
        min: [0, 'Resonance must be between 0 and 100'],
        max: [100, 'Resonance must be between 0 and 100'],
      },
      formants: [
        {
          frequency: {
            type: Number,
            required: [true, 'Formant frequency is required'],
            min: [0, 'Frequency must be positive'],
          },
          amplitude: {
            type: Number,
            required: [true, 'Formant amplitude is required'],
            min: [0, 'Amplitude must be positive'],
          },
          bandwidth: {
            type: Number,
            required: [true, 'Formant bandwidth is required'],
            min: [0, 'Bandwidth must be positive'],
          },
        },
      ],
    },
    dynamics: {
      average: {
        type: Number,
        required: [true, 'Average dynamics is required'],
        min: [0, 'Average must be positive'],
      },
      min: {
        type: Number,
        required: [true, 'Minimum dynamics is required'],
        min: [0, 'Minimum must be positive'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum dynamics is required'],
        min: [0, 'Maximum must be positive'],
      },
      range: {
        type: Number,
        required: [true, 'Dynamics range is required'],
        min: [0, 'Range must be positive'],
      },
      variation: {
        type: Number,
        required: [true, 'Dynamics variation is required'],
        min: [0, 'Variation must be between 0 and 100'],
        max: [100, 'Variation must be between 0 and 100'],
      },
      envelope: {
        attack: {
          type: Number,
          required: [true, 'Attack time is required'],
          min: [0, 'Attack time must be positive'],
        },
        decay: {
          type: Number,
          required: [true, 'Decay time is required'],
          min: [0, 'Decay time must be positive'],
        },
        sustain: {
          type: Number,
          required: [true, 'Sustain level is required'],
          min: [0, 'Sustain level must be between 0 and 100'],
          max: [100, 'Sustain level must be between 0 and 100'],
        },
        release: {
          type: Number,
          required: [true, 'Release time is required'],
          min: [0, 'Release time must be positive'],
        },
      },
    },
    spectralAnalysis: {
      centroid: {
        type: Number,
        required: [true, 'Spectral centroid is required'],
        min: [0, 'Centroid must be positive'],
      },
      spread: {
        type: Number,
        required: [true, 'Spectral spread is required'],
        min: [0, 'Spread must be positive'],
      },
      skewness: {
        type: Number,
        required: [true, 'Spectral skewness is required'],
      },
      kurtosis: {
        type: Number,
        required: [true, 'Spectral kurtosis is required'],
      },
      flatness: {
        type: Number,
        required: [true, 'Spectral flatness is required'],
        min: [0, 'Flatness must be between 0 and 100'],
        max: [100, 'Flatness must be between 0 and 100'],
      },
      rolloff: {
        type: Number,
        required: [true, 'Spectral rolloff is required'],
        min: [0, 'Rolloff must be positive'],
      },
      flux: {
        type: Number,
        required: [true, 'Spectral flux is required'],
        min: [0, 'Flux must be positive'],
      },
      harmonics: [
        {
          frequency: {
            type: Number,
            required: [true, 'Harmonic frequency is required'],
            min: [0, 'Frequency must be positive'],
          },
          amplitude: {
            type: Number,
            required: [true, 'Harmonic amplitude is required'],
            min: [0, 'Amplitude must be positive'],
          },
          phase: {
            type: Number,
            required: [true, 'Harmonic phase is required'],
          },
        },
      ],
    },
    breathing: {
      rate: {
        type: Number,
        required: [true, 'Breathing rate is required'],
        min: [0, 'Rate must be positive'],
      },
      depth: {
        type: Number,
        required: [true, 'Breathing depth is required'],
        min: [0, 'Depth must be between 0 and 100'],
        max: [100, 'Depth must be between 0 and 100'],
      },
      stability: {
        type: Number,
        required: [true, 'Breathing stability is required'],
        min: [0, 'Stability must be between 0 and 100'],
        max: [100, 'Stability must be between 0 and 100'],
      },
      support: {
        type: Number,
        required: [true, 'Breathing support is required'],
        min: [0, 'Support must be between 0 and 100'],
        max: [100, 'Support must be between 0 and 100'],
      },
      markers: [
        {
          type: {
            type: String,
            required: [true, 'Breathing marker type is required'],
          },
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
          intensity: {
            type: Number,
            required: [true, 'Marker intensity is required'],
            min: [0, 'Intensity must be between 0 and 100'],
            max: [100, 'Intensity must be between 0 and 100'],
          },
        },
      ],
    },
    articulation: {
      clarity: {
        type: Number,
        required: [true, 'Articulation clarity is required'],
        min: [0, 'Clarity must be between 0 and 100'],
        max: [100, 'Clarity must be between 0 and 100'],
      },
      precision: {
        type: Number,
        required: [true, 'Articulation precision is required'],
        min: [0, 'Precision must be between 0 and 100'],
        max: [100, 'Precision must be between 0 and 100'],
      },
      consistency: {
        type: Number,
        required: [true, 'Articulation consistency is required'],
        min: [0, 'Consistency must be between 0 and 100'],
        max: [100, 'Consistency must be between 0 and 100'],
      },
      phonemes: [
        {
          type: {
            type: String,
            required: [true, 'Phoneme type is required'],
          },
          timestamp: {
            type: Number,
            required: [true, 'Phoneme timestamp is required'],
            min: [0, 'Timestamp must be positive'],
          },
          duration: {
            type: Number,
            required: [true, 'Phoneme duration is required'],
            min: [0, 'Duration must be positive'],
          },
          accuracy: {
            type: Number,
            required: [true, 'Phoneme accuracy is required'],
            min: [0, 'Accuracy must be between 0 and 100'],
            max: [100, 'Accuracy must be between 0 and 100'],
          },
        },
      ],
    },
    problems: [
      {
        type: {
          type: String,
          required: [true, 'Problem type is required'],
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          required: [true, 'Problem severity is required'],
        },
        timestamp: {
          type: Number,
          required: [true, 'Problem timestamp is required'],
          min: [0, 'Timestamp must be positive'],
        },
        duration: {
          type: Number,
          required: [true, 'Problem duration is required'],
          min: [0, 'Duration must be positive'],
        },
        description: {
          type: String,
          required: [true, 'Problem description is required'],
        },
        suggestions: [String],
      },
    ],
    metrics: {
      overallScore: {
        type: Number,
        required: [true, 'Overall score is required'],
        min: [0, 'Score must be between 0 and 100'],
        max: [100, 'Score must be between 0 and 100'],
      },
      pitchScore: {
        type: Number,
        required: [true, 'Pitch score is required'],
        min: [0, 'Score must be between 0 and 100'],
        max: [100, 'Score must be between 0 and 100'],
      },
      rhythmScore: {
        type: Number,
        required: [true, 'Rhythm score is required'],
        min: [0, 'Score must be between 0 and 100'],
        max: [100, 'Score must be between 0 and 100'],
      },
      timbreScore: {
        type: Number,
        required: [true, 'Timbre score is required'],
        min: [0, 'Score must be between 0 and 100'],
        max: [100, 'Score must be between 0 and 100'],
      },
      dynamicsScore: {
        type: Number,
        required: [true, 'Dynamics score is required'],
        min: [0, 'Score must be between 0 and 100'],
        max: [100, 'Score must be between 0 and 100'],
      },
      breathingScore: {
        type: Number,
        required: [true, 'Breathing score is required'],
        min: [0, 'Score must be between 0 and 100'],
        max: [100, 'Score must be between 0 and 100'],
      },
      articulationScore: {
        type: Number,
        required: [true, 'Articulation score is required'],
        min: [0, 'Score must be between 0 and 100'],
        max: [100, 'Score must be between 0 and 100'],
      },
      confidence: {
        type: Number,
        required: [true, 'Confidence score is required'],
        min: [0, 'Confidence must be between 0 and 100'],
        max: [100, 'Confidence must be between 0 and 100'],
      },
    },
    visualizations: [
      {
        type: {
          type: String,
          required: [true, 'Visualization type is required'],
        },
        data: {
          type: Schema.Types.Mixed,
          required: [true, 'Visualization data is required'],
        },
        timestamp: {
          type: Number,
          required: [true, 'Visualization timestamp is required'],
          min: [0, 'Timestamp must be positive'],
        },
        duration: {
          type: Number,
          required: [true, 'Visualization duration is required'],
          min: [0, 'Duration must be positive'],
        },
      },
    ],
    processingTime: {
      type: Number,
      required: [true, 'Processing time is required'],
      min: [0, 'Processing time must be positive'],
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    error: {
      code: String,
      message: String,
      details: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
voiceAnalysisSchema.index({ userId: 1, exerciseId: 1 });
voiceAnalysisSchema.index({ userId: 1, createdAt: -1 });
voiceAnalysisSchema.index({ exerciseId: 1, processingStatus: 1 });
voiceAnalysisSchema.index({ 'metrics.overallScore': -1 });
voiceAnalysisSchema.index({ processingStatus: 1, createdAt: -1 });

// Virtuals
voiceAnalysisSchema.virtual('durationFormatted').get(function () {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

voiceAnalysisSchema.virtual('isProcessing').get(function () {
  return this.processingStatus === 'processing';
});

voiceAnalysisSchema.virtual('isComplete').get(function () {
  return this.processingStatus === 'completed';
});

voiceAnalysisSchema.virtual('hasFailed').get(function () {
  return this.processingStatus === 'failed';
});

// Métodos
voiceAnalysisSchema.methods.updateStatus = async function (
  status: string,
  error?: any
): Promise<void> {
  this.processingStatus = status;
  if (error) {
    this.error = error;
  }
  await this.save();
};

voiceAnalysisSchema.methods.addVisualization = async function (
  visualData: any
): Promise<void> {
  this.visualizations.push(visualData);
  await this.save();
};

voiceAnalysisSchema.methods.addProblem = async function (
  problemData: any
): Promise<void> {
  this.problems.push(problemData);
  await this.save();
};

voiceAnalysisSchema.methods.updateMetrics = async function (
  metricsData: any
): Promise<void> {
  this.metrics = {
    ...this.metrics,
    ...metricsData,
  };
  await this.save();
};

// Configuração do modelo
voiceAnalysisSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const VoiceAnalysis = mongoose.model<IVoiceAnalysis>(
  'VoiceAnalysis',
  voiceAnalysisSchema
);

export default VoiceAnalysis; 