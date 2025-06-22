import { Request, Response } from 'express';
import { Achievement } from '../models/Achievement';
import { VoiceAnalysis } from '../models/VoiceAnalysis';
import { UserProgress } from '../models/UserProgress';
import { User } from '../models/User';
import logger from '../config/logger';

// Interface para o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Verificar e atualizar conquistas do usuário
export const checkAchievements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user._id;

    // Buscar análises de voz do usuário
    const analyses = await VoiceAnalysis.find({ userId });
    const perfectScores = analyses.filter(a => a.score === 100).length;

    // Buscar progresso do usuário
    const userProgress = await UserProgress.findOne({ userId });
    const exercisesCompleted = userProgress?.totalAttempts || 0;
    const totalPracticeTime = userProgress?.totalPracticeTime || 0;

    // Buscar todas as conquistas
    const achievements = await Achievement.find({ userId });

    for (const achievement of achievements) {
      let progress = 0;

      // Calcular progresso baseado no tipo de conquista
      switch (achievement.criteria?.type) {
        case 'exercises_completed':
          progress = (exercisesCompleted / (achievement.criteria?.value || 1)) * 100;
          break;
        case 'perfect_scores':
          progress = (perfectScores / (achievement.criteria?.value || 1)) * 100;
          break;
        case 'practice_time':
          progress = (totalPracticeTime / (achievement.criteria?.value || 1)) * 100;
          break;
        default:
          progress = 0;
      }

      // Atualizar progresso da conquista
      achievement.progress = progress;

      // Marcar como completa se atingiu 100%
      if (progress >= 100 && !achievement.completed) {
        achievement.completed = true;
        achievement.completedAt = new Date();
      }

      await achievement.save();
    }

    res.json({
      message: 'Conquistas verificadas com sucesso',
      achievements: achievements.map(a => ({
        id: a._id,
        name: a.name,
        description: a.description,
        progress: a.progress,
        completed: a.completed,
        completedAt: a.completedAt
      }))
    });
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar conquistas do usuário
export const getUserAchievements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user._id;
    const achievements = await Achievement.find({ userId });

    res.json({
      achievements: achievements.map(a => ({
        id: a._id,
        name: a.name,
        description: a.description,
        progress: a.progress,
        completed: a.completed,
        completedAt: a.completedAt
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const initializeUserAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }
    
    const userId = req.user._id;
    
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

export class AchievementController {
  // Obter conquistas do usuário
  static async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const achievements = await Achievement.find({ userId: user._id })
        .sort({ unlockedAt: -1 });

      res.status(200).json({
        status: 'success',
        data: {
          achievements,
        },
      });
    } catch (error) {
      logger.error('Get user achievements error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Obter todas as conquistas disponíveis
  static async getAllAchievements(req: Request, res: Response): Promise<void> {
    try {
      const achievements = await Achievement.find()
        .sort({ name: 1 });

      res.status(200).json({
        status: 'success',
        data: {
          achievements,
        },
      });
    } catch (error) {
      logger.error('Get all achievements error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Desbloquear conquista
  static async unlockAchievement(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { achievementId } = req.body;

      // Verificar se a conquista já foi desbloqueada
      const existingAchievement = await Achievement.findOne({
        userId: user._id,
        achievementId,
      });

      if (existingAchievement) {
        res.status(400).json({
          status: 'error',
          message: 'Conquista já desbloqueada',
        });
        return;
      }

      // Criar nova conquista
      const achievement = new Achievement({
        userId: user._id,
        achievementId,
        unlockedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await achievement.save();

      logger.info('Achievement unlocked', {
        userId: user._id,
        achievementId,
      });

      res.status(201).json({
        status: 'success',
        message: 'Conquista desbloqueada com sucesso',
        data: {
          achievement,
        },
      });
    } catch (error) {
      logger.error('Unlock achievement error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Verificar conquistas automaticamente
  static async checkAchievements(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { action, value } = req.body;

      // Lista de conquistas disponíveis
      const availableAchievements = [
        {
          id: 'first_exercise',
          name: 'Primeiro Exercício',
          description: 'Complete seu primeiro exercício vocal',
          condition: (action: string, value: number) => action === 'exercise_completed' && value >= 1,
        },
        {
          id: 'practice_streak_7',
          name: 'Semana de Dedicação',
          description: 'Pratique por 7 dias consecutivos',
          condition: (action: string, value: number) => action === 'streak_updated' && value >= 7,
        },
        {
          id: 'practice_streak_30',
          name: 'Mês de Dedicação',
          description: 'Pratique por 30 dias consecutivos',
          condition: (action: string, value: number) => action === 'streak_updated' && value >= 30,
        },
        {
          id: 'high_score',
          name: 'Alta Pontuação',
          description: 'Alcance uma pontuação de 90 ou mais',
          condition: (action: string, value: number) => action === 'score_achieved' && value >= 90,
        },
        {
          id: 'practice_time_1h',
          name: 'Uma Hora de Prática',
          description: 'Acumule 1 hora de tempo de prática',
          condition: (action: string, value: number) => action === 'practice_time' && value >= 3600,
        },
      ];

      const unlockedAchievements = [];

      for (const achievement of availableAchievements) {
        // Verificar se já foi desbloqueada
        const existingAchievement = await Achievement.findOne({
          userId: user._id,
          achievementId: achievement.id,
        });

        if (!existingAchievement && achievement.condition(action, value)) {
          // Desbloquear conquista
          const newAchievement = new Achievement({
            userId: user._id,
            achievementId: achievement.id,
            name: achievement.name,
            description: achievement.description,
            unlockedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          await newAchievement.save();
          unlockedAchievements.push(newAchievement);

          logger.info('Achievement automatically unlocked', {
            userId: user._id,
            achievementId: achievement.id,
            action,
            value,
          });
        }
      }

      res.status(200).json({
        status: 'success',
        message: 'Verificação de conquistas concluída',
        data: {
          unlockedAchievements,
          totalUnlocked: unlockedAchievements.length,
        },
      });
    } catch (error) {
      logger.error('Check achievements error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Obter estatísticas de conquistas
  static async getAchievementStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const totalAchievements = await Achievement.countDocuments({ userId: user._id });
      const recentAchievements = await Achievement.find({ userId: user._id })
        .sort({ unlockedAt: -1 })
        .limit(5);

      const stats = {
        totalAchievements,
        recentAchievements,
        progress: Math.round((totalAchievements / 10) * 100), // Assumindo 10 conquistas totais
      };

      res.status(200).json({
        status: 'success',
        data: {
          stats,
        },
      });
    } catch (error) {
      logger.error('Get achievement stats error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }
} 