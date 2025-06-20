import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceCapture from '../VoiceCapture';

describe('VoiceCapture Component', () => {
  it('renders start button initially', () => {
    render(<VoiceCapture />);
    expect(screen.getByText(/Começar/i)).toBeInTheDocument();
  });

  it('shows canvas when recording starts', async () => {
    render(<VoiceCapture />);
    const startButton = screen.getByText(/Começar/i);
    
    fireEvent.click(startButton);
    
    await waitFor(() => {
      const canvas = screen.getByTestId('waveform-canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  it('handles permission denial gracefully', async () => {
    // Mock getUserMedia to reject
    const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true
    });

    render(<VoiceCapture />);
    const startButton = screen.getByText(/Começar/i);
    
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Permissão negada/i)).toBeInTheDocument();
    });
  });
}); 