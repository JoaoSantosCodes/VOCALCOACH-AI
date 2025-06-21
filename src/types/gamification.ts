export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  completedAt?: Date;
  category: AchievementCategory;
  level: AchievementLevel;
  requirements: AchievementRequirement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlockedAt?: Date;
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievements: Achievement[];
  badges: Badge[];
  streakDays: number;
  lastPracticeDate?: Date;
  practiceHistory: PracticeSession[];
  challengesCompleted: number;
}

export interface PracticeSession {
  id: string;
  date: Date;
  duration: number;
  exercisesCompleted: number;
  pointsEarned: number;
  achievements: Achievement[];
  metrics: {
    pitchAccuracy: number;
    rhythmAccuracy: number;
    breathControl: number;
    overallScore: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  points: number;
  duration: number;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  startDate: Date;
  endDate: Date;
  participants: number;
}

export interface Leaderboard {
  global: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  challenges: {
    [challengeId: string]: LeaderboardEntry[];
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
  level: number;
  achievements: number;
  lastActive: Date;
}

export enum AchievementCategory {
  PRACTICE = 'practice',
  PERFORMANCE = 'performance',
  SOCIAL = 'social',
  CHALLENGE = 'challenge',
  SPECIAL = 'special',
}

export enum AchievementLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum ChallengeType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special',
  COMMUNITY = 'community',
}

export enum ChallengeDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface AchievementRequirement {
  type: string;
  value: number;
  current: number;
}

export interface ChallengeRequirement {
  type: string;
  value: number;
  description: string;
}

export interface ChallengeReward {
  type: string;
  value: number;
  description: string;
}

export interface GamificationConfig {
  levelingSystem: {
    baseExperience: number;
    experienceMultiplier: number;
    maxLevel: number;
  };
  points: {
    practiceMinute: number;
    exerciseCompletion: number;
    perfectScore: number;
    dailyStreak: number;
    challengeCompletion: number;
  };
  streaks: {
    minDailyPractice: number;
    maxStreakBonus: number;
    streakBonusMultiplier: number;
  };
} 