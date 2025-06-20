import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import LoginModal from '../../components/Auth/LoginModal';
import { theme } from '../../utils/theme';

describe('LoginModal Component', () => {
  const mockOnClose = jest.fn();

  const renderLoginModal = (open = true) => {
    return render(
      <ThemeProvider theme={theme}>
        <LoginModal open={open} onClose={mockOnClose} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders nothing when closed', () => {
    renderLoginModal(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal content when open', async () => {
    renderLoginModal(true);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Bem-vindo ao VocalCoach AI')).toBeInTheDocument();
    expect(screen.getByText('Faça login para começar sua jornada vocal')).toBeInTheDocument();
  });

  it('renders social login buttons with correct text and icons', async () => {
    renderLoginModal(true);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4); // 3 social buttons + 1 close button

    expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com apple/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    renderLoginModal(true);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders terms of service text and link', async () => {
    renderLoginModal(true);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText(/ao continuar, você concorda com nossos/i)).toBeInTheDocument();
    const termsLink = screen.getByRole('link', { name: /termos de serviço/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '#');
  });

  it('handles social login button clicks without errors', async () => {
    renderLoginModal(true);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const googleButton = screen.getByRole('button', { name: /continuar com google/i });
    const facebookButton = screen.getByRole('button', { name: /continuar com facebook/i });
    const appleButton = screen.getByRole('button', { name: /continuar com apple/i });

    await act(async () => {
      await userEvent.click(googleButton);
    });
    await act(async () => {
      await userEvent.click(facebookButton);
    });
    await act(async () => {
      await userEvent.click(appleButton);
    });

    // Since the onClick handlers are empty, we just verify the buttons are still there
    expect(googleButton).toBeInTheDocument();
    expect(facebookButton).toBeInTheDocument();
    expect(appleButton).toBeInTheDocument();
  });
}); 