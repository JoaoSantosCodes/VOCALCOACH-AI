import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ThemeProvider } from '@mui/material';
import Dashboard from '../../../pages/Dashboard';
import { theme } from '../../../utils/theme';
import '../../../__mocks__/matchMedia.mock';

const server = setupServer(
  // Mock API endpoints
  rest.get('/api/stats', (req, res, ctx) => {
    return res(
      ctx.json({
        sessionsCount: 32,
        totalHours: 24,
        score: 850,
        accuracy: 92,
        trends: {
          sessions: { value: 12, isPositive: true },
          hours: { value: 8, isPositive: true },
          score: { value: 15, isPositive: true },
          accuracy: { value: 5, isPositive: true }
        }
      })
    );
  }),
  
  rest.get('/api/progress', (req, res, ctx) => {
    return res(
      ctx.json({
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Pontuação',
            data: [650, 700, 720, 780, 820, 850],
          },
          {
            label: 'Precisão',
            data: [75, 78, 82, 85, 88, 92],
          },
        ],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderDashboard = () => {
  return render(
    <ThemeProvider theme={theme}>
      <Dashboard />
    </ThemeProvider>
  );
};

describe('Dashboard Integration Tests', () => {
  describe('Initial Loading', () => {
    it('should show loading state initially', () => {
      renderDashboard();
      expect(screen.queryByText('Olá, Músico!')).not.toBeInTheDocument();
    });

    it('should load and display dashboard content', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Olá, Músico!')).toBeInTheDocument();
      });
    });
  });

  describe('Stats Display', () => {
    it('should display all stat cards with correct data', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Sessões de Treino')).toBeInTheDocument();
        expect(screen.getByText('32')).toBeInTheDocument();
        expect(screen.getByText('Tempo Total')).toBeInTheDocument();
        expect(screen.getByText('24h')).toBeInTheDocument();
        expect(screen.getByText('Pontuação')).toBeInTheDocument();
        expect(screen.getByText('850')).toBeInTheDocument();
        expect(screen.getByText('Precisão')).toBeInTheDocument();
        expect(screen.getByText('92%')).toBeInTheDocument();
      });
    });

    it('should display trend indicators correctly', async () => {
      renderDashboard();
      await waitFor(() => {
        const trends = screen.getAllByTestId('trend-indicator');
        expect(trends).toHaveLength(4);
        trends.forEach(trend => {
          expect(trend).toHaveClass('positive');
        });
      });
    });
  });

  describe('Progress Chart', () => {
    it('should render progress chart with correct data', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Evolução do Desempenho')).toBeInTheDocument();
        const chart = screen.getByTestId('progress-chart');
        expect(chart).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      server.use(
        rest.get('/api/stats', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
      });
    });

    it('should retry loading data on error', async () => {
      let attemptCount = 0;
      server.use(
        rest.get('/api/stats', (req, res, ctx) => {
          attemptCount++;
          if (attemptCount === 1) {
            return res(ctx.status(500));
          }
          return res(
            ctx.json({
              sessionsCount: 32,
              totalHours: 24,
              score: 850,
              accuracy: 92,
              trends: {
                sessions: { value: 12, isPositive: true },
                hours: { value: 8, isPositive: true },
                score: { value: 15, isPositive: true },
                accuracy: { value: 5, isPositive: true }
              }
            })
          );
        })
      );

      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('32')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update stats when new data is received', async () => {
      renderDashboard();
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('32')).toBeInTheDocument();
      });

      // Simulate new data
      server.use(
        rest.get('/api/stats', (req, res, ctx) => {
          return res(
            ctx.json({
              sessionsCount: 33,
              totalHours: 25,
              score: 860,
              accuracy: 93,
              trends: {
                sessions: { value: 13, isPositive: true },
                hours: { value: 9, isPositive: true },
                score: { value: 16, isPositive: true },
                accuracy: { value: 6, isPositive: true }
              }
            })
          );
        })
      );

      // Trigger update (you'll need to implement this mechanism in the Dashboard component)
      // For example, through a websocket message or polling
      await waitFor(() => {
        expect(screen.getByText('33')).toBeInTheDocument();
        expect(screen.getByText('25h')).toBeInTheDocument();
        expect(screen.getByText('860')).toBeInTheDocument();
        expect(screen.getByText('93%')).toBeInTheDocument();
      });
    });
  });
}); 