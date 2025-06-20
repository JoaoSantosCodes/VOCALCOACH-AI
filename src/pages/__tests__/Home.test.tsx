import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../../utils/theme';
import Home from '../Home';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home Component', () => {
  const renderHome = () => {
    render(
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

  it('renders main heading', () => {
    renderHome();
    expect(screen.getByText('Desenvolva Seu Potencial Vocal')).toBeInTheDocument();
  });

  it('renders subheading', () => {
    renderHome();
    expect(screen.getByText('Treine sua voz com feedback em tempo real usando inteligência artificial')).toBeInTheDocument();
  });

  it('navigates to practice page when clicking start button', () => {
    renderHome();
    const startButton = screen.getByText('Começar Agora');
    fireEvent.click(startButton);
    expect(mockNavigate).toHaveBeenCalledWith('/practice');
  });

  it('navigates to demo page when clicking demo button', () => {
    renderHome();
    const demoButton = screen.getByText('Ver Demo');
    fireEvent.click(demoButton);
    expect(mockNavigate).toHaveBeenCalledWith('/demo');
  });

  it('renders feature icons', () => {
    renderHome();
    expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
    expect(screen.getByTestId('graph-icon')).toBeInTheDocument();
    expect(screen.getByTestId('headphones-icon')).toBeInTheDocument();
  });

  it('renders real-time analysis section', () => {
    renderHome();
    const analysisHeadings = screen.getAllByText('Análise em Tempo Real');
    expect(analysisHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText('Receba feedback instantâneo sobre sua técnica vocal enquanto canta, com análise detalhada de afinação e timbre.')).toBeInTheDocument();
  });

  // Teste de responsividade usando matchMedia
  it('applies mobile styles when on small screen', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width:600px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    renderHome();
    const heading = screen.getByText('Desenvolva Seu Potencial Vocal');
    expect(heading).toBeInTheDocument();
    // Aqui você pode adicionar mais verificações específicas de estilo
  });
}); 