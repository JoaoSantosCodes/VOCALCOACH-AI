import { Request, Response } from 'express';
import Stats from '../models/Stats';
import User from '../models/User';
import VoiceAnalysis from '../models/VoiceAnalysis';

export const getStats = async (req: Request, res: Response) => {
  try {
    let stats = await Stats.findOne();
    
    if (!stats) {
      // If no stats exist, create initial stats
      const totalUsers = await User.countDocuments();
      const totalExercises = await VoiceAnalysis.countDocuments();
      const analyses = await VoiceAnalysis.find();
      const averageScore = analyses.length > 0 
        ? analyses.reduce((acc, curr) => acc + (curr.score || 0), 0) / analyses.length 
        : 0;

      stats = await Stats.create({
        totalUsers,
        activeUsers: 0, // This would need a proper active session tracking
        totalExercises,
        averageScore,
        lastUpdated: new Date()
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
};

export const updateStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExercises = await VoiceAnalysis.countDocuments();
    const analyses = await VoiceAnalysis.find();
    const averageScore = analyses.length > 0 
      ? analyses.reduce((acc, curr) => acc + (curr.score || 0), 0) / analyses.length 
      : 0;

    const stats = await Stats.findOneAndUpdate(
      {},
      {
        totalUsers,
        totalExercises,
        averageScore,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error updating statistics', error });
  }
}; 