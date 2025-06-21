import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
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
} from '../types/gamification';

interface GamificationState {
  userProgress: UserProgress | null;
  achievements: Achievement[];
  badges: Badge[];
  challenges: Challenge[];
  leaderboard: {
    global: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
  };
  isLoading: boolean;
  error: string | null;
}

export const useGamification = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState<GamificationState>({
    userProgress: null,
    achievements: [],
    badges: [],
    challenges: [],
    leaderboard: {
      global: [],
      weekly: [],
      monthly: [],
    },
    isLoading: true,
    error: null,
  });

  // Carrega dados iniciais
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Carrega todos os dados do usuário
  const loadUserData = async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const [progress, achievements, badges, challenges, globalLeaderboard, weeklyLeaderboard, monthlyLeaderboard] =
        await Promise.all([
          gamificationService.getUserProgress(user.id),
          gamificationService.getAchievements(user.id),
          gamificationService.getBadges(user.id),
          gamificationService.getChallenges(ChallengeType.DAILY),
          gamificationService.getLeaderboard('global'),
          gamificationService.getLeaderboard('weekly'),
          gamificationService.getLeaderboard('monthly'),
        ]);

      setState({
        userProgress: progress,
        achievements,
        badges,
        challenges,
        leaderboard: {
          global: globalLeaderboard,
          weekly: weeklyLeaderboard,
          monthly: monthlyLeaderboard,
        },
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

  // Atualiza progresso após uma sessão de prática
  const updateProgress = useCallback(async (session: PracticeSession) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const updatedProgress = await gamificationService.updateProgress(user.id, session);

      // Verifica novas conquistas
      const newAchievements = updatedProgress.achievements.filter(
        achievement => !state.achievements.find(a => a.id === achievement.id)
      );

      // Notifica novas conquistas
      newAchievements.forEach(achievement => {
        enqueueSnackbar(`🏆 Nova conquista: ${achievement.title}`, {
          variant: 'success',
          autoHideDuration: 5000,
        });
      });

      // Atualiza estado
      setState(prev => ({
        ...prev,
        userProgress: updatedProgress,
        achievements: updatedProgress.achievements,
        isLoading: false,
      }));

      // Recarrega leaderboards se necessário
      if (newAchievements.length > 0) {
        const [globalLeaderboard, weeklyLeaderboard, monthlyLeaderboard] = await Promise.all([
          gamificationService.getLeaderboard('global'),
          gamificationService.getLeaderboard('weekly'),
          gamificationService.getLeaderboard('monthly'),
        ]);

        setState(prev => ({
          ...prev,
          leaderboard: {
            global: globalLeaderboard,
            weekly: weeklyLeaderboard,
            monthly: monthlyLeaderboard,
          },
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao atualizar progresso',
      }));
      console.error('Error updating progress:', error);
    }
  }, [user, state.achievements, enqueueSnackbar]);

  // Participa de um desafio
  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await gamificationService.joinChallenge(user.id, challengeId);

      // Recarrega desafios
      const challenges = await gamificationService.getChallenges(ChallengeType.DAILY);

      setState(prev => ({
        ...prev,
        challenges,
        isLoading: false,
      }));

      enqueueSnackbar('Você entrou no desafio!', {
        variant: 'success',
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao entrar no desafio',
      }));
      console.error('Error joining challenge:', error);
    }
  }, [user, enqueueSnackbar]);

  // Recarrega leaderboards
  const refreshLeaderboards = useCallback(async () => {
    try {
      const [globalLeaderboard, weeklyLeaderboard, monthlyLeaderboard] = await Promise.all([
        gamificationService.getLeaderboard('global'),
        gamificationService.getLeaderboard('weekly'),
        gamificationService.getLeaderboard('monthly'),
      ]);

      setState(prev => ({
        ...prev,
        leaderboard: {
          global: globalLeaderboard,
          weekly: weeklyLeaderboard,
          monthly: monthlyLeaderboard,
        },
      }));
    } catch (error) {
      console.error('Error refreshing leaderboards:', error);
    }
  }, []);

  return {
    ...state,
    updateProgress,
    joinChallenge,
    refreshLeaderboards,
    reloadData: loadUserData,
  };
}; 