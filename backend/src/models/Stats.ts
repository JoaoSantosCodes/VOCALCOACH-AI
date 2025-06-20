import mongoose, { Schema, Document } from 'mongoose';

export interface IStats extends Document {
  totalUsers: number;
  activeUsers: number;
  totalExercises: number;
  averageScore: number;
  lastUpdated: Date;
}

const StatsSchema: Schema = new Schema({
  totalUsers: {
    type: Number,
    required: true,
    default: 0
  },
  activeUsers: {
    type: Number,
    required: true,
    default: 0
  },
  totalExercises: {
    type: Number,
    required: true,
    default: 0
  },
  averageScore: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export default mongoose.model<IStats>('Stats', StatsSchema); 