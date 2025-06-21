import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import confetti from 'canvas-confetti';
import { useAuth } from './useAuth';
import { gamificationService } from '../services/gamification.service';
import {
  UserProgress,
  Achievement,
  Badge,
  Challenge,
  PracticeSession,
  LeaderboardEntry,
  ChallengeType,
  GamificationEvent,
  Reward,
} from '../types/gamification';

interface GamificationState {
  userProgress: UserProgress | null;
  achievements: Achievement[];
  badges: Badge[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

export const useGamification = (userId: string) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState<GamificationState>({
    userProgress: null,
    achievements: [],
    badges: [],
    challenges: [],
    leaderboard: [],
    isLoading: true,
    error: null,
  });

  // Carrega dados iniciais
  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  // Configura event listeners
  useEffect(() => {
    const handleGamificationEvent = (event: GamificationEvent) => {
      if (event.userId !== userId) return;

      switch (event.type) {
        case 'reward_earned':
          handleReward(event.data as Reward);
          break;
        case 'level_up':
          handleLevelUp(event.data);
          break;
        case 'achievement_unlocked':
          handleAchievement(event.data);
          break;
        case 'streak_updated':
          handleStreak(event.data);
          break;
        case 'streak_broken':
          handleStreakBroken(event.data);
          break;
        case 'challenge_completed':
          handleChallengeCompleted(event.data);
          break;
      }
    };

    gamificationService.addEventListener(handleGamificationEvent);

    return () => {
      // TODO: Implementar remoção do event listener quando disponível
    };
  }, [userId]);

  const loadGamificationData = async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const [userProgress, achievements, badges, challenges, leaderboard] = await Promise.all([
        gamificationService.getUserProgress(user.id),
        gamificationService.getAchievements(user.id),
        gamificationService.getBadges(user.id),
        gamificationService.getChallenges(ChallengeType.DAILY),
        gamificationService.getLeaderboard('global'),
      ]);

      setState({
        userProgress,
        achievements,
        badges,
        challenges,
        leaderboard,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar dados de gamificação',
      }));
      console.error('Error loading gamification data:', error);
    }
  };

  const handleReward = (reward: Reward) => {
    // Atualiza estado local
    setState(prev => {
      if (!prev.userProgress) return prev;

      const updatedProgress = { ...prev.userProgress };

      switch (reward.type) {
        case 'points':
          updatedProgress.totalPoints += reward.value as number;
          break;
        case 'badge':
          const newBadge = reward.value as Badge;
          updatedProgress.badges = [...updatedProgress.badges, newBadge];
          break;
        case 'achievement':
          const newAchievement = reward.value as Achievement;
          updatedProgress.achievements = [...updatedProgress.achievements, newAchievement];
          break;
      }

      return {
        ...prev,
        userProgress: updatedProgress,
      };
    });

    // Mostra notificação
    enqueueSnackbar(reward.message, {
      variant: 'success',
      autoHideDuration: 3000,
    });
  };

  const handleLevelUp = (data: { newLevel: number; rewards: Reward[] }) => {
    // Efeito visual
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Notificação
    enqueueSnackbar(`Parabéns! Você alcançou o nível ${data.newLevel}!`, {
      variant: 'success',
      autoHideDuration: 5000,
    });

    // Processa recompensas
    data.rewards.forEach(handleReward);
  };

  const handleAchievement = (data: { achievement: Achievement; bonusPoints: number }) => {
    // Efeito visual
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
    });

    // Notificação
    enqueueSnackbar(
      `Conquista desbloqueada: ${data.achievement.title}! +${data.bonusPoints} pontos!`,
      {
        variant: 'success',
        autoHideDuration: 5000,
      }
    );

    // Atualiza estado local
    setState(prev => {
      if (!prev.userProgress) return prev;

      return {
        ...prev,
        achievements: [...prev.achievements, data.achievement],
        userProgress: {
          ...prev.userProgress,
          totalPoints: prev.userProgress.totalPoints + data.bonusPoints,
        },
      };
    });
  };

  const handleStreak = (data: { streakDays: number; bonus: number }) => {
    // Notificação
    enqueueSnackbar(
      `Sequência de ${data.streakDays} dias! Bônus: +${data.bonus} pontos!`,
      {
        variant: 'info',
        autoHideDuration: 3000,
      }
    );

    // Atualiza estado local
    setState(prev => {
      if (!prev.userProgress) return prev;

      return {
        ...prev,
        userProgress: {
          ...prev.userProgress,
          streakDays: data.streakDays,
          totalPoints: prev.userProgress.totalPoints + data.bonus,
        },
      };
    });
  };

  const handleStreakBroken = (data: { previousStreak: number }) => {
    // Notificação
    enqueueSnackbar(
      `Sua sequência de ${data.previousStreak} dias foi interrompida. Continue praticando!`,
      {
        variant: 'warning',
        autoHideDuration: 5000,
      }
    );

    // Atualiza estado local
    setState(prev => {
      if (!prev.userProgress) return prev;

      return {
        ...prev,
        userProgress: {
          ...prev.userProgress,
          streakDays: 0,
        },
      };
    });
  };

  const handleChallengeCompleted = (data: { challenge: Challenge; rewards: Reward[] }) => {
    // Efeito visual
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FF1493', '#00FF00'],
    });

    // Notificação
    enqueueSnackbar(
      `Desafio completado: ${data.challenge.title}!`,
      {
        variant: 'success',
        autoHideDuration: 5000,
      }
    );

    // Processa recompensas
    data.rewards.forEach(handleReward);

    // Atualiza estado local
    setState(prev => {
      if (!prev.userProgress) return prev;

      return {
        ...prev,
        challenges: prev.challenges.filter(c => c.id !== data.challenge.id),
        userProgress: {
          ...prev.userProgress,
          challengesCompleted: prev.userProgress.challengesCompleted + 1,
        },
      };
    });
  };

  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await gamificationService.joinChallenge(user.id, challengeId);
      
      // Atualiza lista de desafios
      const challenges = await gamificationService.getChallenges(ChallengeType.DAILY);
      setState(prev => ({ ...prev, challenges }));

      enqueueSnackbar('Você entrou no desafio!', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao entrar no desafio',
      }));
      console.error('Error joining challenge:', error);
    }
  }, [user]);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const leaderboard = await gamificationService.getLeaderboard('global');
      setState(prev => ({ ...prev, leaderboard }));
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    }
  }, []);

  return {
    ...state,
    joinChallenge,
    refreshLeaderboard,
    reloadData: loadGamificationData,
  };
}; 