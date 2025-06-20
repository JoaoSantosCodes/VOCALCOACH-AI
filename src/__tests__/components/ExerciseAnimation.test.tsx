import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { ExerciseAnimation } from '../../components/VoiceExercise/ExerciseAnimation';
import { theme } from '../../utils/theme';

describe('ExerciseAnimation Component', () => {
  const renderAnimation = (type = 'breathing', isPlaying = true) => {
    return render(
      <ThemeProvider theme={theme}>
        <ExerciseAnimation type={type} isPlaying={isPlaying} />
      </ThemeProvider>
    );
  };

  it('renders without crashing', () => {
    renderAnimation();
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('renders with different animation types', () => {
    const types = ['breathing', 'hold', 'release', 'lying', 'inhale', 'exhale'];
    
    types.forEach(type => {
      const { rerender } = renderAnimation(type);
      expect(screen.getByRole('presentation')).toBeInTheDocument();
      
      // Testa com isPlaying false
      rerender(
        <ThemeProvider theme={theme}>
          <ExerciseAnimation type={type} isPlaying={false} />
        </ThemeProvider>
      );
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });
  });

  it('applies correct styles for breathing animation', () => {
    renderAnimation('breathing');
    const container = screen.getByRole('presentation');
    expect(container).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
  });

  it('handles invalid animation type gracefully', () => {
    renderAnimation('invalid-type' as any);
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('applies animations when playing', () => {
    renderAnimation('breathing', true);
    const container = screen.getByRole('presentation');
    const animatedDiv = container.querySelector('div');
    expect(animatedDiv).toHaveStyle('transform: scale(1)');
  });

  it('stops animations when not playing', () => {
    renderAnimation('breathing', false);
    const container = screen.getByRole('presentation');
    const animatedDiv = container.querySelector('div');
    expect(animatedDiv).toHaveStyle('transform: scale(1)');
  });

  it('renders nested animated elements', () => {
    renderAnimation('breathing');
    const container = screen.getByRole('presentation');
    const outerCircle = container.querySelector('div');
    const innerCircle = outerCircle?.querySelector('div');
    
    expect(outerCircle).toBeInTheDocument();
    expect(innerCircle).toBeInTheDocument();
  });

  it('applies theme colors correctly', () => {
    renderAnimation('breathing');
    const container = screen.getByRole('presentation');
    const animatedDiv = container.querySelector('div');
    expect(animatedDiv).toHaveStyle(`background-color: ${theme.palette.primary.main}`);
  });

  it('handles rapid prop changes', () => {
    const { rerender } = renderAnimation('breathing', true);

    // Simula mudanças rápidas de props
    ['hold', 'release', 'inhale', 'exhale'].forEach(type => {
      rerender(
        <ThemeProvider theme={theme}>
          <ExerciseAnimation type={type} isPlaying={true} />
        </ThemeProvider>
      );
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });
  });
}); 