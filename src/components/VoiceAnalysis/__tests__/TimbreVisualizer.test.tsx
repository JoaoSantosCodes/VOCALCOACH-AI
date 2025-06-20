import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { theme } from '../../../utils/theme';
import TimbreVisualizer from '../TimbreVisualizer';

describe('TimbreVisualizer Component', () => {
  const mockFeatures = {
    spectralCentroid: 2500, // 50% de 5000
    spectralFlatness: 0.5,  // 50% de 1
    spectralRolloff: 5000,  // 50% de 10000
    harmonicRatio: 0.5      // 50% de 1
  };

  const renderTimbreVisualizer = (features = mockFeatures) => {
    render(
      <ThemeProvider theme={theme}>
        <TimbreVisualizer features={features} />
      </ThemeProvider>
    );
  };

  it('renders title correctly', () => {
    renderTimbreVisualizer();
    expect(screen.getByText('Análise de Timbre')).toBeInTheDocument();
  });

  it('renders all feature labels', () => {
    renderTimbreVisualizer();
    expect(screen.getByText('Brilho')).toBeInTheDocument();
    expect(screen.getByText('Riqueza Harmônica')).toBeInTheDocument();
    expect(screen.getByText('Decaimento Espectral')).toBeInTheDocument();
    expect(screen.getByText('Razão Harmônica')).toBeInTheDocument();
  });

  it('shows correct percentage values', () => {
    renderTimbreVisualizer();
    // Todos os valores mockados são 50%
    const percentages = screen.getAllByText('50%');
    expect(percentages).toHaveLength(4);
  });

  it('renders interpretation section', () => {
    renderTimbreVisualizer();
    expect(screen.getByText('Interpretação:')).toBeInTheDocument();
    expect(screen.getByText(/Brilho: Indica a presença/)).toBeInTheDocument();
    expect(screen.getByText(/Riqueza Harmônica: Mostra/)).toBeInTheDocument();
    expect(screen.getByText(/Decaimento Espectral: Indica/)).toBeInTheDocument();
    expect(screen.getByText(/Razão Harmônica: Mede/)).toBeInTheDocument();
  });

  it('handles extreme values correctly', () => {
    const extremeFeatures = {
      spectralCentroid: 5000, // 100%
      spectralFlatness: 0,    // 0%
      spectralRolloff: 10000, // 100%
      harmonicRatio: 1        // 100%
    };

    renderTimbreVisualizer(extremeFeatures);
    expect(screen.getAllByText('100%')).toHaveLength(3);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders progress bars', () => {
    renderTimbreVisualizer();
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(4);
    
    // Verifica se todos os progress bars estão com 50%
    progressBars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-valuenow', '50');
    });
  });
}); 