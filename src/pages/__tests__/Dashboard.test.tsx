import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from '../Dashboard';

// Mock do tema
const theme = createTheme({
  gradients: {
    text: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    glass: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    secondary: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  },
});

// Mock das respostas da API
const mockStats = {
  sessionsCount: 42,
  totalHours: 24,
  score: 850,
  accuracy: 95,
  trends: {
    sessions: 10,
    hours: 5,
    score: 15,
    accuracy: 8,
  },
};

const mockProgress = {
  labels: ['Jan', 'Fev', 'Mar'],
  datasets: [
    {
      label: 'Pontuação',
      data: [65, 75, 85],
    },
  ],
};

// Mock do fetch
global.fetch = jest.fn((url) =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve(url.includes('stats') ? mockStats : mockProgress),
  })
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );
    
    // Não deve mostrar conteúdo inicialmente
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  it('renders dashboard content after successful API call', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    // Verifica se os dados estão sendo exibidos corretamente
    expect(screen.getByText('42')).toBeInTheDocument(); // sessionsCount
    expect(screen.getByText('24h')).toBeInTheDocument(); // totalHours
    expect(screen.getByText('850')).toBeInTheDocument(); // score
    expect(screen.getByText('95%')).toBeInTheDocument(); // accuracy
  });

  it('matches snapshot with animations', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    // Aguarda as animações terminarem
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(container).toMatchSnapshot();
  });

  // Testes de regressão visual com animações
  describe('Visual Regression Tests', () => {
    it('renders correctly in initial state', async () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot('dashboard-initial');
    });

    it('renders correctly after loading', async () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot('dashboard-loaded');
    });

    it('renders correctly with error state', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      const { container } = render(
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot('dashboard-error');
    });

    it('renders animations correctly', async () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      );

      // Captura snapshots em diferentes momentos da animação
      expect(container).toMatchSnapshot('animation-start');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      });

      // Aguarda 100ms para capturar o estado intermediário da animação
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(container).toMatchSnapshot('animation-middle');

      // Aguarda a animação terminar
      await new Promise((resolve) => setTimeout(resolve, 900));
      expect(container).toMatchSnapshot('animation-end');
    });
  });
}); 