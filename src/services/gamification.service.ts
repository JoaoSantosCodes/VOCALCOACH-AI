import {
  Achievement,
  Badge,
  UserProgress,
  PracticeSession,
  Challenge,
  LeaderboardEntry,
  GamificationConfig,
  AchievementCategory,
  AchievementLevel,
  BadgeRarity,
  ChallengeType,
  GamificationEvent,
  Reward,
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
      minDailyPractice: 10,
      maxStreakBonus: 50,
      streakBonusMultiplier: 1.1,
    },
  };

  private eventListeners: ((event: GamificationEvent) => void)[] = [];

  // Event handling
  public addEventListener(listener: (event: GamificationEvent) => void): void {
    this.eventListeners.push(listener);
  }

  private emitEvent(type: string, userId: string, data: any): void {
    const event: GamificationEvent = {
      type,
      userId,
      data,
      timestamp: new Date(),
    };
    this.eventListeners.forEach(listener => listener(event));
  }

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
      const rewards = await this.processSession(userId, session, userProgress);
      
      // Notifica sobre as recompensas
      rewards.forEach(reward => {
        this.emitEvent('reward_earned', userId, reward);
      });

      // Salva progresso atualizado
      await this.saveUserProgress(userId, userProgress);

      return userProgress;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  private async processSession(
    userId: string,
    session: PracticeSession,
    progress: UserProgress
  ): Promise<Reward[]> {
    const rewards: Reward[] = [];

    // Calcula pontos e experiência
    const earnedPoints = this.calculateSessionPoints(session);
    const earnedExperience = this.calculateSessionExperience(session);

    // Atualiza estatísticas
    progress.stats.totalPracticeTime += session.duration;
    progress.stats.exercisesCompleted += session.exercisesCompleted;
    progress.stats.averageScore = (
      (progress.stats.averageScore * (progress.practiceHistory.length) + session.metrics.overallScore) /
      (progress.practiceHistory.length + 1)
    );
    if (session.metrics.overallScore >= 95) {
      progress.stats.perfectSessions++;
    }

    // Atualiza pontos e experiência
    progress.totalPoints += earnedPoints;
    progress.experience += earnedExperience;

    rewards.push({
      type: 'points',
      value: earnedPoints,
      message: `Ganhou ${earnedPoints} pontos na sessão!`,
    });

    // Verifica level up
    const levelUpRewards = await this.handleLevelProgress(userId, progress);
    rewards.push(...levelUpRewards);

    // Atualiza streak
    const streakRewards = await this.handleStreak(userId, session, progress);
    rewards.push(...streakRewards);

    // Atualiza histórico
    progress.practiceHistory.push(session);

    // Verifica conquistas
    const achievementRewards = await this.checkAchievements(userId, progress);
    rewards.push(...achievementRewards);

    // Verifica desafios
    const challengeRewards = await this.checkChallenges(userId, session, progress);
    rewards.push(...challengeRewards);

    return rewards;
  }

  private async handleLevelProgress(
    userId: string,
    progress: UserProgress
  ): Promise<Reward[]> {
    const rewards: Reward[] = [];

    while (progress.experience >= progress.experienceToNextLevel) {
      progress.experience -= progress.experienceToNextLevel;
      progress.level++;
      progress.experienceToNextLevel = this.calculateExperienceForLevel(progress.level);

      const levelRewards = await this.getLevelUpRewards(progress.level);
      rewards.push(...levelRewards);

      this.emitEvent('level_up', userId, {
        newLevel: progress.level,
        rewards: levelRewards,
      });
    }

    return rewards;
  }

  private async handleStreak(
    userId: string,
    session: PracticeSession,
    progress: UserProgress
  ): Promise<Reward[]> {
    const rewards: Reward[] = [];

    if (this.isValidForStreak(session, progress.lastPracticeDate)) {
      progress.streakDays++;
      
      if (progress.streakDays > progress.stats.longestStreak) {
        progress.stats.longestStreak = progress.streakDays;
      }

      const streakBonus = Math.min(
        this.config.streaks.maxStreakBonus,
        Math.floor(this.config.points.dailyStreak * Math.pow(this.config.streaks.streakBonusMultiplier, progress.streakDays - 1))
      );

      progress.totalPoints += streakBonus;
      rewards.push({
        type: 'points',
        value: streakBonus,
        message: `Bônus de streak: +${streakBonus} pontos! (${progress.streakDays} dias)`,
      });

      this.emitEvent('streak_updated', userId, {
        streakDays: progress.streakDays,
        bonus: streakBonus,
      });
    } else {
      if (progress.streakDays > 0) {
        this.emitEvent('streak_broken', userId, {
          previousStreak: progress.streakDays,
        });
      }
      progress.streakDays = 1;
    }

    progress.lastPracticeDate = session.date;
    return rewards;
  }

  private isValidForStreak(session: PracticeSession, lastPracticeDate?: Date): boolean {
    if (!lastPracticeDate) return true;

    const today = new Date(session.date);
    const lastPractice = new Date(lastPracticeDate);
    const diffDays = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays === 1 && session.duration >= this.config.streaks.minDailyPractice;
  }

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

  private calculateSessionExperience(session: PracticeSession): number {
    return Math.floor(this.calculateSessionPoints(session) * 0.5);
  }

  private async getLevelUpRewards(level: number): Promise<Reward[]> {
    const rewards: Reward[] = [];

    // Recompensas base por level up
    rewards.push({
      type: 'points',
      value: level * 100,
      message: `Bônus de level up: +${level * 100} pontos!`,
    });

    // Badges especiais por níveis importantes
    if (level === 10) {
      rewards.push({
        type: 'badge',
        value: {
          id: 'novice_vocalist',
          title: 'Vocalista Iniciante',
          description: 'Alcançou o nível 10',
          rarity: BadgeRarity.COMMON,
          icon: 'badge_novice',
          unlockedAt: new Date(),
        },
        message: 'Desbloqueou a insígnia de Vocalista Iniciante!',
      });
    } else if (level === 25) {
      rewards.push({
        type: 'badge',
        value: {
          id: 'intermediate_vocalist',
          title: 'Vocalista Intermediário',
          description: 'Alcançou o nível 25',
          rarity: BadgeRarity.RARE,
          icon: 'badge_intermediate',
          unlockedAt: new Date(),
        },
        message: 'Desbloqueou a insígnia de Vocalista Intermediário!',
      });
    } else if (level === 50) {
      rewards.push({
        type: 'badge',
        value: {
          id: 'advanced_vocalist',
          title: 'Vocalista Avançado',
          description: 'Alcançou o nível 50',
          rarity: BadgeRarity.EPIC,
          icon: 'badge_advanced',
          unlockedAt: new Date(),
        },
        message: 'Desbloqueou a insígnia de Vocalista Avançado!',
      });
    } else if (level === 100) {
      rewards.push({
        type: 'badge',
        value: {
          id: 'master_vocalist',
          title: 'Mestre Vocal',
          description: 'Alcançou o nível máximo!',
          rarity: BadgeRarity.LEGENDARY,
          icon: 'badge_master',
          unlockedAt: new Date(),
        },
        message: 'Desbloqueou a insígnia de Mestre Vocal!',
      });
    }

    return rewards;
  }

  private async checkAchievements(userId: string, progress: UserProgress): Promise<Reward[]> {
    const rewards: Reward[] = [];
    const allAchievements = await this.getAllAchievements();

    for (const achievement of allAchievements) {
      if (!progress.achievements.find(a => a.id === achievement.id)) {
        const isCompleted = this.checkAchievementCompletion(achievement, progress);
        if (isCompleted) {
          achievement.isCompleted = true;
          achievement.completedAt = new Date();
          progress.achievements.push(achievement);

          rewards.push({
            type: 'achievement',
            value: achievement,
            message: `Conquista desbloqueada: ${achievement.title}!`,
          });

          // Pontos bônus por conquista
          const bonusPoints = this.calculateAchievementBonus(achievement);
          progress.totalPoints += bonusPoints;

          rewards.push({
            type: 'points',
            value: bonusPoints,
            message: `Bônus por conquista: +${bonusPoints} pontos!`,
          });

          this.emitEvent('achievement_unlocked', userId, {
            achievement,
            bonusPoints,
          });
        }
      }
    }

    return rewards;
  }

  private calculateAchievementBonus(achievement: Achievement): number {
    const basePoints = achievement.points;
    let multiplier = 1;

    switch (achievement.level) {
      case AchievementLevel.BRONZE:
        multiplier = 1;
        break;
      case AchievementLevel.SILVER:
        multiplier = 2;
        break;
      case AchievementLevel.GOLD:
        multiplier = 3;
        break;
      case AchievementLevel.PLATINUM:
        multiplier = 4;
        break;
      case AchievementLevel.DIAMOND:
        multiplier = 5;
        break;
    }

    return basePoints * multiplier;
  }

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
      case AchievementCategory.STREAK:
        return this.checkStreakAchievement(achievement, progress);
      case AchievementCategory.MILESTONE:
        return this.checkMilestoneAchievement(achievement, progress);
      default:
        return false;
    }
  }

  private checkPracticeAchievement(achievement: Achievement, progress: UserProgress): boolean {
    return progress.stats.totalPracticeTime >= achievement.requirements[0].value;
  }

  private checkPerformanceAchievement(achievement: Achievement, progress: UserProgress): boolean {
    return progress.stats.perfectSessions >= achievement.requirements[0].value;
  }

  private checkSocialAchievement(achievement: Achievement, progress: UserProgress): boolean {
    // TODO: Implementar quando tivermos recursos sociais
    return false;
  }

  private checkChallengeAchievement(achievement: Achievement, progress: UserProgress): boolean {
    return progress.challengesCompleted >= achievement.requirements[0].value;
  }

  private checkStreakAchievement(achievement: Achievement, progress: UserProgress): boolean {
    return progress.stats.longestStreak >= achievement.requirements[0].value;
  }

  private checkMilestoneAchievement(achievement: Achievement, progress: UserProgress): boolean {
    switch (achievement.requirements[0].type) {
      case 'level':
        return progress.level >= achievement.requirements[0].value;
      case 'points':
        return progress.totalPoints >= achievement.requirements[0].value;
      case 'exercises':
        return progress.stats.exercisesCompleted >= achievement.requirements[0].value;
      default:
        return false;
    }
  }

  private async checkChallenges(
    userId: string,
    session: PracticeSession,
    progress: UserProgress
  ): Promise<Reward[]> {
    const rewards: Reward[] = [];
    const activeChallenges = await this.getActiveChallenges();

    for (const challenge of activeChallenges) {
      if (challenge.participants.includes(userId)) {
        const challengeProgress = this.calculateChallengeProgress(challenge, session);
        
        if (challengeProgress >= 100) {
          progress.challengesCompleted++;
          
          // Adiciona recompensas do desafio
          rewards.push({
            type: 'points',
            value: challenge.rewards.points,
            message: `Desafio completado: ${challenge.title}! +${challenge.rewards.points} pontos`,
          });

          if (challenge.rewards.badge) {
            rewards.push({
              type: 'badge',
              value: challenge.rewards.badge,
              message: `Desbloqueou a insígnia ${challenge.rewards.badge.title}!`,
            });
          }

          this.emitEvent('challenge_completed', userId, {
            challenge,
            rewards,
          });
        }
      }
    }

    return rewards;
  }

  private calculateChallengeProgress(challenge: Challenge, session: PracticeSession): number {
    // TODO: Implementar cálculo de progresso baseado no tipo de desafio
    return 0;
  }

  public async getLeaderboard(type: 'global' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }

  public async getChallenges(type: ChallengeType): Promise<Challenge[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }

  private async getActiveChallenges(): Promise<Challenge[]> {
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

  private async getUserProgress(userId: string): Promise<UserProgress> {
    // TODO: Implementar busca no banco de dados
    return {
      userId,
      level: 1,
      experience: 0,
      experienceToNextLevel: this.calculateExperienceForLevel(1),
      totalPoints: 0,
      streakDays: 0,
      achievements: [],
      badges: [],
      challengesCompleted: 0,
      practiceHistory: [],
      stats: {
        totalPracticeTime: 0,
        exercisesCompleted: 0,
        averageScore: 0,
        perfectSessions: 0,
        longestStreak: 0,
      },
    };
  }

  private async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
    // TODO: Implementar salvamento no banco de dados
  }

  private async getAllAchievements(): Promise<Achievement[]> {
    // TODO: Implementar busca no banco de dados
    return [];
  }
}

export default new GamificationService(); 