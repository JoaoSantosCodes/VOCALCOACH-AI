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
    expect(screen.getByText(/Desenvolva Seu/i)).toBeInTheDocument();
    expect(screen.getByText(/Potencial Vocal/i)).toBeInTheDocument();
  });

  it('renders subheading', () => {
    renderHome();
    expect(screen.getByText(/Treine sua voz com feedback em tempo real/i)).toBeInTheDocument();
  });

  it('navigates to practice page when clicking start button', () => {
    renderHome();
    const startButton = screen.getByText(/Começar Agora/i);
    fireEvent.click(startButton);
    expect(mockNavigate).toHaveBeenCalledWith('/practice');
  });

  it('navigates to demo page when clicking demo button', () => {
    renderHome();
    const demoButton = screen.getByText(/Ver Demonstração/i);
    fireEvent.click(demoButton);
    expect(mockNavigate).toHaveBeenCalledWith('/demo');
  });

  it('renders feature icons', () => {
    renderHome();
    const icons = screen.getAllByRole('button', { name: '' });
    expect(icons).toHaveLength(3); // Microfone, Gráfico e Fone
  });

  it('renders real-time analysis section', () => {
    renderHome();
    expect(screen.getByText(/Análise em Tempo Real/i)).toBeInTheDocument();
    expect(screen.getByText(/Receba feedback instantâneo/i)).toBeInTheDocument();
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
    const heading = screen.getByText(/Desenvolva Seu/i);
    expect(heading).toBeInTheDocument();
    // Aqui você pode adicionar mais verificações específicas de estilo
  });
}); 