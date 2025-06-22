import { Request, Response } from 'express';
import Stats from '../models/Stats';
import { User } from '../models/User';
import { VoiceAnalysis } from '../models/VoiceAnalysis';
import logger from '../config/logger';
import { UserProgress } from '../models/UserProgress';

// Interface para o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

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

// Obter estatísticas do usuário
export const getUserStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user._id;

    // Buscar análises de voz
    const analyses = await VoiceAnalysis.find({ userId });
    
    // Calcular estatísticas
    const totalAnalyses = analyses.length;
    const averageScore = totalAnalyses > 0
      ? analyses.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalAnalyses
      : 0;
    
    const perfectScores = analyses.filter(a => a.score === 100).length;
    const goodScores = analyses.filter(a => a.score >= 80 && a.score < 100).length;
    const needsImprovement = analyses.filter(a => a.score < 80).length;

    // Buscar progresso do usuário
    const userProgress = await UserProgress.findOne({ userId });
    const totalPracticeTime = userProgress?.totalPracticeTime || 0;
    const exercisesCompleted = userProgress?.totalAttempts || 0;

    res.json({
      stats: {
        totalAnalyses,
        averageScore: Math.round(averageScore * 100) / 100,
        perfectScores,
        goodScores,
        needsImprovement,
        totalPracticeTime,
        exercisesCompleted,
        accuracy: totalAnalyses > 0 ? Math.round((perfectScores / totalAnalyses) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter progresso do usuário
export const getUserProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user._id;

    // Buscar análises dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnalyses = await VoiceAnalysis.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calcular progresso recente
    const recentAverageScore = recentAnalyses.length > 0
      ? recentAnalyses.reduce((acc, curr) => acc + (curr.score || 0), 0) / recentAnalyses.length
      : 0;

    // Buscar progresso geral
    const userProgress = await UserProgress.findOne({ userId });

    res.json({
      progress: {
        recentAnalyses: recentAnalyses.length,
        recentAverageScore: Math.round(recentAverageScore * 100) / 100,
        totalPracticeTime: userProgress?.totalPracticeTime || 0,
        exercisesCompleted: userProgress?.totalAttempts || 0,
        currentStreak: userProgress?.streak || 0,
        longestStreak: userProgress?.streak || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export class StatsController {
  // Obter estatísticas gerais
  static async getGeneralStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      // Buscar estatísticas do usuário
      let stats = await Stats.findOne({ userId: user._id });

      if (!stats) {
        // Criar estatísticas iniciais se não existirem
        stats = new Stats({
          userId: user._id,
          totalExercises: 0,
          averageScore: 0,
          createdAt: new Date(),
        });
        await stats.save();
      }

      res.status(200).json({
        status: 'success',
        data: {
          stats,
        },
      });
    } catch (error) {
      logger.error('Get general stats error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Atualizar estatísticas
  static async updateStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { exerciseScore, practiceTime, exerciseType } = req.body;

      let stats = await Stats.findOne({ userId: user._id });

      if (!stats) {
        stats = new Stats({
          userId: user._id,
          totalExercises: 0,
          averageScore: 0,
          createdAt: new Date(),
        });
      }

      // Atualizar estatísticas
      stats.totalExercises += 1;
      
      if (exerciseScore) {
        const newAverage = (stats.averageScore * (stats.totalExercises - 1) + exerciseScore) / stats.totalExercises;
        stats.averageScore = Math.round(newAverage * 100) / 100;
      }

      await stats.save();

      logger.info('Stats updated', {
        userId: user._id,
        exerciseScore,
        practiceTime,
      });

      res.status(200).json({
        status: 'success',
        message: 'Estatísticas atualizadas com sucesso',
        data: {
          stats,
        },
      });
    } catch (error) {
      logger.error('Update stats error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Obter estatísticas detalhadas
  static async getDetailedStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { period = 'week' } = req.query;

      const startDate = new Date();
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Buscar análises de voz do período
      const voiceAnalyses = await VoiceAnalysis.find({
        userId: user._id,
        createdAt: { $gte: startDate },
      }).sort({ createdAt: -1 });

      // Calcular estatísticas detalhadas
      const totalAnalyses = voiceAnalyses.length;
      const totalPracticeTime = voiceAnalyses.reduce((sum, analysis) => sum + (analysis.duration || 0), 0);
      const averagePitch = voiceAnalyses.length > 0 
        ? voiceAnalyses.reduce((sum, analysis) => sum + (analysis.pitch?.average || 0), 0) / voiceAnalyses.length 
        : 0;
      const averageRhythm = voiceAnalyses.length > 0 
        ? voiceAnalyses.reduce((sum, analysis) => sum + (analysis.rhythm?.tempo || 0), 0) / voiceAnalyses.length 
        : 0;

      const detailedStats = {
        period,
        totalAnalyses,
        totalPracticeTime,
        averagePitch: Math.round(averagePitch * 100) / 100,
        averageRhythm: Math.round(averageRhythm * 100) / 100,
        analyses: voiceAnalyses,
      };

      res.status(200).json({
        status: 'success',
        data: {
          detailedStats,
        },
      });
    } catch (error) {
      logger.error('Get detailed stats error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Obter ranking de usuários
  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const leaderboard = await Stats.find()
        .sort({ averageScore: -1, totalExercises: -1 })
        .limit(Number(limit))
        .populate('userId', 'name email');

      const formattedLeaderboard = leaderboard.map((stat: any, index: number) => ({
        rank: index + 1,
        user: {
          id: stat.userId?._id,
          name: stat.userId?.name,
          email: stat.userId?.email,
        },
        stats: {
          averageScore: stat.averageScore,
          totalExercises: stat.totalExercises,
          level: stat.level,
          experience: stat.experience,
        },
      }));

      res.status(200).json({
        status: 'success',
        data: {
          leaderboard: formattedLeaderboard,
        },
      });
    } catch (error) {
      logger.error('Get leaderboard error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }

  // Resetar estatísticas (apenas para admins)
  static async resetStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { userId } = req.params;

      // Verificar se é admin ou se está resetando suas próprias estatísticas
      if (user.role !== 'admin' && user._id.toString() !== userId) {
        res.status(403).json({
          status: 'error',
          message: 'Acesso negado',
        });
        return;
      }

      await Stats.findOneAndUpdate(
        { userId },
        {
          totalExercises: 0,
          averageScore: 0,
          createdAt: new Date(),
        },
        { upsert: true }
      );

      logger.info('Stats reset', {
        adminId: user._id,
        targetUserId: userId,
      });

      res.status(200).json({
        status: 'success',
        message: 'Estatísticas resetadas com sucesso',
      });
    } catch (error) {
      logger.error('Reset stats error', { error: error instanceof Error ? error.message : String(error) });
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
      });
    }
  }
} 