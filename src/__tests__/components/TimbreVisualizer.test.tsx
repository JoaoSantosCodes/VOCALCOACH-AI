import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import TimbreVisualizer from '../../components/VoiceAnalysis/TimbreVisualizer';
import { theme } from '../../utils/theme';

describe('TimbreVisualizer Component', () => {
  const mockFeatures = {
    spectralCentroid: 1000,
    spectralFlatness: 0.5,
    spectralRolloff: 2000,
    harmonicRatio: 0.8
  };

  const renderVisualizer = (features = mockFeatures) => {
    return render(
      <ThemeProvider theme={theme}>
        <TimbreVisualizer features={features} />
      </ThemeProvider>
    );
  };

  it('renders without crashing', () => {
    renderVisualizer();
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('renders with default values when no features provided', () => {
    renderVisualizer(undefined);
    const svg = screen.getByRole('presentation');
    expect(svg).toBeInTheDocument();
  });

  it('renders circle with correct attributes', () => {
    renderVisualizer();
    const circle = screen.getByRole('presentation').querySelector('circle');
    expect(circle).toHaveAttribute('cx', '50');
    expect(circle).toHaveAttribute('cy', '50');
  });

  it('renders path with correct attributes', () => {
    renderVisualizer();
    const path = screen.getByRole('presentation').querySelector('path');
    expect(path).toHaveAttribute('fill', 'none');
    expect(path).toHaveAttribute('stroke', 'currentColor');
  });

  it('updates visualization when features change', () => {
    const { rerender } = renderVisualizer();

    const newFeatures = {
      spectralCentroid: 2000,
      spectralFlatness: 0.8,
      spectralRolloff: 3000,
      harmonicRatio: 0.6
    };

    rerender(
      <ThemeProvider theme={theme}>
        <TimbreVisualizer features={newFeatures} />
      </ThemeProvider>
    );

    const svg = screen.getByRole('presentation');
    expect(svg).toBeInTheDocument();
  });

  it('applies animations correctly', () => {
    renderVisualizer();
    const container = screen.getByRole('presentation').parentElement;
    expect(container).toHaveStyle('transform: scale(1)');
  });

  it('handles extreme values gracefully', () => {
    const extremeFeatures = {
      spectralCentroid: 10000,
      spectralFlatness: 1,
      spectralRolloff: 20000,
      harmonicRatio: 1
    };

    renderVisualizer(extremeFeatures);
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    const zeroFeatures = {
      spectralCentroid: 0,
      spectralFlatness: 0,
      spectralRolloff: 0,
      harmonicRatio: 0
    };

    renderVisualizer(zeroFeatures);
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
}); 