import { useState, useEffect } from 'react';
import { ContrastLevel } from '../utils/theme';

interface ThemePreferences {
  mode: 'light' | 'dark';
  contrastLevel: ContrastLevel;
}

export const useThemePreference = () => {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const stored = localStorage.getItem('themePreferences');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      contrastLevel: window.matchMedia('(prefers-contrast: more)').matches ? 'high' : 'normal',
    };
  });

  useEffect(() => {
    // Observa mudanças nas preferências do sistema
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({
        ...prev,
        mode: e.matches ? 'dark' : 'light',
      }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({
        ...prev,
        contrastLevel: e.matches ? 'high' : 'normal',
      }));
    };

    darkModeQuery.addEventListener('change', handleDarkModeChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Salva preferências no localStorage
  useEffect(() => {
    localStorage.setItem('themePreferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleMode = () => {
    setPreferences(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  const toggleContrast = () => {
    setPreferences(prev => ({
      ...prev,
      contrastLevel: prev.contrastLevel === 'normal' ? 'high' : 'normal',
    }));
  };

  return {
    ...preferences,
    toggleMode,
    toggleContrast,
  };
}; 