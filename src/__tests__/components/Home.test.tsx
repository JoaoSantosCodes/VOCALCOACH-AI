import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import Home from '../../pages/Home';
import { theme } from '../../utils/theme';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock @react-spring/web
jest.mock('@react-spring/web', () => {
  const React = require('react');
  return {
    useSpring: () => ({ opacity: 1, transform: 'translate3d(0,0px,0)' }),
    animated: {
      div: ({ children, style, ...props }) => React.createElement('div', { 'data-testid': 'animated-div', style, ...props }, children),
    },
    useTransition: (item) => {
      const transitions = [(style, i) => (
        React.createElement('div', { 'data-testid': 'animated-div', style }, i)
      )];
      transitions.map = (fn) => [fn({ opacity: 1, transform: 'translate3d(0,0px,0)' }, item)];
      return transitions;
    },
  };
});

describe('Home Component', () => {
  const renderHome = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Home />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders main heading', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('Desenvolva Seu Potencial Vocal')).toBeInTheDocument();
    });
  });

  it('renders subheading', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('Treine sua voz com feedback em tempo real usando inteligência artificial')).toBeInTheDocument();
    });
  });

  it('navigates to practice page when clicking start button', async () => {
    renderHome();
    const startButton = await screen.findByText('Começar Agora');
    await act(async () => {
      await userEvent.click(startButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/practice');
  });

  it('navigates to demo page when clicking demo button', async () => {
    renderHome();
    const demoButton = await screen.findByText('Ver Demo');
    await act(async () => {
      await userEvent.click(demoButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/demo');
  });

  it('renders feature cards', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getAllByText('Análise em Tempo Real')[0]).toBeInTheDocument();
      expect(screen.getByText('Exercícios Personalizados')).toBeInTheDocument();
      expect(screen.getByText('Acompanhamento Detalhado')).toBeInTheDocument();
    });
  });

  it('renders testimonials section', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
      expect(screen.getByText('Carlos Santos')).toBeInTheDocument();
      expect(screen.getByText('Mariana Costa')).toBeInTheDocument();
    });
  });

  it('renders real-time analysis section', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getAllByText(/Análise em Tempo Real/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Receba feedback instantâneo/i)).toBeInTheDocument();
    });
  });

  it('renders blog section', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('Como melhorar seu alcance vocal')).toBeInTheDocument();
      expect(screen.getByText('Técnicas de respiração para cantores')).toBeInTheDocument();
      expect(screen.getByText('Os benefícios do aquecimento vocal')).toBeInTheDocument();
    });
  });

  it('renders feature icons', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
      expect(screen.getByTestId('graph-icon')).toBeInTheDocument();
      expect(screen.getByTestId('headphones-icon')).toBeInTheDocument();
    });
  });

  it('renders blog post read more buttons', async () => {
    renderHome();
    await waitFor(() => {
      const readMoreButtons = screen.getAllByText(/Ler mais/i);
      expect(readMoreButtons).toHaveLength(3);
    });
  });
}); 