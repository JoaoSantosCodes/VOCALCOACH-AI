import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../../../utils/theme';
import Navbar from '../Navbar';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
  const renderNavbar = () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Navbar />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders logo', () => {
    renderNavbar();
    expect(screen.getByText(/VocalCoach AI/i)).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderNavbar();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('opens login modal when clicking login button', () => {
    renderNavbar();
    const loginButton = screen.getByText(/Login/i);
    fireEvent.click(loginButton);
    // Verifica se o modal foi aberto
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('navigates to home when clicking logo', () => {
    renderNavbar();
    const logo = screen.getByText(/VocalCoach AI/i);
    fireEvent.click(logo);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Teste de responsividade
  it('shows menu icon on mobile', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width:600px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    renderNavbar();
    expect(screen.getByLabelText(/menu/i)).toBeInTheDocument();
  });

  it('opens mobile menu when clicking menu icon', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width:600px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    renderNavbar();
    const menuButton = screen.getByLabelText(/menu/i);
    fireEvent.click(menuButton);
    // Verifica se o menu mobile foi aberto
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
}); 