import { Request, Response } from 'express';
import Achievement from '../models/Achievement';
import VoiceAnalysis from '../models/VoiceAnalysis';

export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Assuming user is attached to request by auth middleware
    const achievements = await Achievement.find({ userId });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching achievements', error });
  }
};

export const checkAndUpdateAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get user's voice analyses
    const analyses = await VoiceAnalysis.find({ userId });
    
    // Calculate metrics
    const exercisesCompleted = analyses.length;
    const perfectScores = analyses.filter(a => a.score === 100).length;
    const totalPracticeTime = analyses.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    
    // Get user's achievements
    const achievements = await Achievement.find({ userId });
    
    // Update each achievement's progress
    const updates = achievements.map(async (achievement) => {
      let progress = 0;
      
      switch (achievement.criteria.type) {
        case 'exercises_completed':
          progress = (exercisesCompleted / achievement.criteria.value) * 100;
          break;
        case 'perfect_scores':
          progress = (perfectScores / achievement.criteria.value) * 100;
          break;
        case 'practice_time':
          progress = (totalPracticeTime / achievement.criteria.value) * 100;
          break;
      }
      
      // Cap progress at 100%
      progress = Math.min(progress, 100);
      
      // Update achievement
      achievement.progress = progress;
      if (progress >= 100 && !achievement.completed) {
        achievement.completed = true;
        achievement.completedAt = new Date();
      }
      
      return achievement.save();
    });
    
    await Promise.all(updates);
    
    // Return updated achievements
    const updatedAchievements = await Achievement.find({ userId });
    res.json(updatedAchievements);
  } catch (error) {
    res.status(500).json({ message: 'Error updating achievements', error });
  }
};

export const initializeUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Define default achievements
    const defaultAchievements = [
      {
        userId,
        name: 'Beginner Vocalist',
        description: 'Complete your first 5 exercises',
        icon: '🎤',
        criteria: { type: 'exercises_completed', value: 5 }
      },
      {
        userId,
        name: 'Perfect Pitch',
        description: 'Get 3 perfect scores',
        icon: '🎯',
        criteria: { type: 'perfect_scores', value: 3 }
      },
      {
        userId,
        name: 'Practice Makes Perfect',
        description: 'Practice for 1 hour total',
        icon: '⏱️',
        criteria: { type: 'practice_time', value: 3600 } // 3600 seconds = 1 hour
      }
    ];
    
    // Create achievements if they don't exist
    for (const achievement of defaultAchievements) {
      await Achievement.findOneAndUpdate(
        { userId, name: achievement.name },
        achievement,
        { upsert: true, new: true }
      );
    }
    
    const achievements = await Achievement.find({ userId });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Error initializing achievements', error });
  }
}; 