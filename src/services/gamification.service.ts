import {
  Achievement,
  Badge,
  UserProgress,
  PracticeSession,
  Challenge,
  Leaderboard,
  GamificationConfig,
  AchievementCategory,
  AchievementLevel,
  BadgeRarity,
  ChallengeType,
} from '../types/gamification';

class GamificationService {
  private config: GamificationConfig = {
    levelingSystem: {
      baseExperience: 100,
      experienceMultiplier: 1.5,
      maxLevel: 100,
    },
    points: {
      practiceMinute: 1,
      exerciseCompletion: 10,
      perfectScore: 50,
      dailyStreak: 5,
      challengeCompletion: 100,
    },
    streaks: {
      minDailyPractice: 10, // minutos
      maxStreakBonus: 50,
      streakBonusMultiplier: 1.1,
    },
  };

  // Calcula experiência necessária para o próximo nível
  private calculateExperienceForLevel(level: number): number {
    return Math.floor(
      this.config.levelingSystem.baseExperience *
      Math.pow(this.config.levelingSystem.experienceMultiplier, level - 1)
    );
  }

  // Atualiza o progresso do usuário após uma sessão de prática
  public async updateProgress(userId: string, session: PracticeSession): Promise<UserProgress> {
    try {
      const userProgress = await this.getUserProgress(userId);
      const earnedPoints = this.calculateSessionPoints(session);
      const earnedExperience = this.calculateSessionExperience(session);

      // Atualiza pontos e experiência
      userProgress.totalPoints += earnedPoints;
      userProgress.experience += earnedExperience;

      // Verifica level up
      while (userProgress.experience >= userProgress.experienceToNextLevel) {
        userProgress.experience -= userProgress.experienceToNextLevel;
        userProgress.level++;
        userProgress.experienceToNextLevel = this.calculateExperienceForLevel(userProgress.level);
        await this.handleLevelUp(userId, userProgress.level);
      }

      // Atualiza streak
      if (this.isValidForStreak(session, userProgress.lastPracticeDate)) {
        userProgress.streakDays++;
      } else {
        userProgress.streakDays = 1;
      }

      userProgress.lastPracticeDate = session.date;
      userProgress.practiceHistory.push(session);

      // Verifica conquistas
      const newAchievements = await this.checkAchievements(userId, userProgress);
      userProgress.achievements = [...userProgress.achievements, ...newAchievements];

      // Salva progresso atualizado
      await this.saveUserProgress(userId, userProgress);

      return userProgress;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // Verifica se a sessão é válida para manter/incrementar streak
  private isValidForStreak(session: PracticeSession, lastPracticeDate?: Date): boolean {
    if (!lastPracticeDate) return true;

    const today = new Date(session.date);
    const lastPractice = new Date(lastPracticeDate);
    const diffDays = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays === 1 && session.duration >= this.config.streaks.minDailyPractice;
  }

  // Calcula pontos ganhos em uma sessão
  private calculateSessionPoints(session: PracticeSession): number {
    let points = 0;

    // Pontos por minuto de prática
    points += Math.floor(session.duration) * this.config.points.practiceMinute;

    // Pontos por exercícios completados
    points += session.exercisesCompleted * this.config.points.exerciseCompletion;

    // Bônus por performance perfeita
    if (session.metrics.overallScore >= 95) {
      points += this.config.points.perfectScore;
    }

    return points;
  }

  // Calcula experiência ganha em uma sessão
  private calculateSessionExperience(session: PracticeSession): number {
    return Math.floor(this.calculateSessionPoints(session) * 0.5);
  }

  // Lida com level up do usuário
  private async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    // Implementar lógica de recompensas por level up
    const rewards = this.getLevelUpRewards(newLevel);
    await this.grantRewards(userId, rewards);
  }

  // Verifica e atualiza conquistas
  private async checkAchievements(userId: string, progress: UserProgress): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const allAchievements = await this.getAllAchievements();

    for (const achievement of allAchievements) {
      if (!progress.achievements.find(a => a.id === achievement.id)) {
        const isCompleted = this.checkAchievementCompletion(achievement, progress);
        if (isCompleted) {
          achievement.isCompleted = true;
          achievement.completedAt = new Date();
          newAchievements.push(achievement);
        }
      }
    }

    return newAchievements;
  }

  // Verifica se uma conquista foi completada
  private checkAchievementCompletion(achievement: Achievement, progress: UserProgress): boolean {
    switch (achievement.category) {
      case AchievementCategory.PRACTICE:
        return this.checkPracticeAchievement(achievement, progress);
      case AchievementCategory.PERFORMANCE:
        return this.checkPerformanceAchievement(achievement, progress);
      case AchievementCategory.SOCIAL:
        return this.checkSocialAchievement(achievement, progress);
      case AchievementCategory.CHALLENGE:
        return this.checkChallengeAchievement(achievement, progress);
      default:
        return false;
    }
  }

  // Métodos auxiliares para verificar diferentes tipos de conquistas
  private checkPracticeAchievement(achievement: Achievement, progress: UserProgress): boolean {
    const totalPracticeTime = progress.practiceHistory.reduce((total, session) => total + session.duration, 0);
    return totalPracticeTime >= achievement.requirements[0].value;
  }

  private checkPerformanceAchievement(achievement: Achievement, progress: UserProgress): boolean {
    const perfectSessions = progress.practiceHistory.filter(session => session.metrics.overallScore >= 95);
    return perfectSessions.length >= achievement.requirements[0].value;
  }

  private checkSocialAchievement(achievement: Achievement, progress: UserProgress): boolean {
    // Implementar lógica de conquistas sociais
    return false;
  }

  private checkChallengeAchievement(achievement: Achievement, progress: UserProgress): boolean {
    return progress.challengesCompleted >= achievement.requirements[0].value;
  }

  // Métodos de acesso a dados (a serem implementados com a camada de persistência)
  private async getUserProgress(userId: string): Promise<UserProgress> {
    // TODO: Implementar busca no banco de dados
    return {} as UserProgress;
  }

  private async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
    // TODO: Implementar salvamento no banco de dados
  }

  private async getAllAchievements(): Promise<Achievement[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }

  private async grantRewards(userId: string, rewards: any): Promise<void> {
    // TODO: Implementar lógica de recompensas
  }

  private getLevelUpRewards(level: number): any {
    // TODO: Implementar lógica de recompensas por level
    return {};
  }

  // API pública para outros serviços
  public async getLeaderboard(type: 'global' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }

  public async getChallenges(type: ChallengeType): Promise<Challenge[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }

  public async joinChallenge(userId: string, challengeId: string): Promise<void> {
    // TODO: Implementar lógica de participação em desafios
  }

  public async getAchievements(userId: string): Promise<Achievement[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }

  public async getBadges(userId: string): Promise<Badge[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }
}

export const gamificationService = new GamificationService(); 