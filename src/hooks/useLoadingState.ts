import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
}

export const useLoadingState = (initialMessage: string = '') => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: initialMessage,
  });

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      message: message || initialMessage,
    });
  }, [initialMessage]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState((prev) => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
      message: message || prev.message,
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      message,
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
      progress: 100,
    }));
  }, []);

  const resetLoading = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: initialMessage,
    });
  }, [initialMessage]);

  return {
    ...state,
    startLoading,
    updateProgress,
    setMessage,
    stopLoading,
    resetLoading,
  };
}; 