import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceCapture from '../../../components/VoiceAnalysis/VoiceCapture';

// Mock dos Web Workers
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage(data: any) {
    if (this.onmessage) {
      // Simula análise de áudio
      this.onmessage({
        data: {
          type: 'result',
          data: {
            pitch: 440,
            clarity: 85,
            volume: 75,
            isSilence: false,
            snr: 15
          }
        }
      } as MessageEvent);
    }
  }
  terminate() {}
}

// Mock do MediaRecorder e APIs de áudio
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  onerror: jest.fn(),
  state: 'inactive',
  stream: null
};

const mockAudioContext = {
  createMediaStreamSource: jest.fn().mockReturnValue({
    connect: jest.fn()
  }),
  createAnalyser: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    getByteTimeDomainData: jest.fn(),
    getFloatTimeDomainData: jest.fn(),
    fftSize: 2048,
    frequencyBinCount: 1024
  }),
  close: jest.fn()
};

// Setup dos mocks
beforeAll(() => {
  // Mock do Worker
  (global as any).Worker = MockWorker;
  
  // Mock do MediaRecorder
  (global as any).MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);
  
  // Mock do AudioContext
  (global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
  
  // Mock do canvas
  (global as any).HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0
  });
  
  // Mock das permissões do navegador
  (global as any).navigator.mediaDevices = {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{
        stop: jest.fn()
      }]
    })
  };
  
  (global as any).navigator.permissions = {
    query: jest.fn().mockResolvedValue({
      state: 'granted',
      onchange: null
    })
  };
});

describe('VoiceCapture Component', () => {
  it('renderiza corretamente no estado inicial', () => {
    render(<VoiceCapture />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('inicia a gravação quando o botão é clicado', async () => {
    render(<VoiceCapture />);
    const button = screen.getByRole('button');
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    expect(mockMediaRecorder.start).toHaveBeenCalled();
  });

  it('para a gravação quando clicado novamente', async () => {
    render(<VoiceCapture />);
    const button = screen.getByRole('button');
    
    // Inicia gravação
    await act(async () => {
      fireEvent.click(button);
    });
    
    // Para gravação
    await act(async () => {
      fireEvent.click(button);
    });
    
    expect(mockMediaRecorder.stop).toHaveBeenCalled();
  });

  it('chama onAnalysisUpdate com os dados corretos', () => {
    const mockOnAnalysisUpdate = jest.fn();
    render(<VoiceCapture onAnalysisUpdate={mockOnAnalysisUpdate} />);
    
    // Simula mensagem do worker
    act(() => {
      const worker = new MockWorker();
      worker.postMessage({});
    });
    
    expect(mockOnAnalysisUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        pitch: 440,
        clarity: 85,
        volume: 75,
        isSilence: false,
        snr: 15
      })
    );
  });

  it('mostra aviso de qualidade baixa quando SNR < 10', () => {
    const { container } = render(<VoiceCapture />);
    
    act(() => {
      const worker = new MockWorker();
      worker.onmessage?.({
        data: {
          type: 'result',
          data: {
            pitch: 440,
            clarity: 85,
            volume: 75,
            isSilence: false,
            snr: 5
          }
        }
      } as MessageEvent);
    });
    
    expect(screen.getByText(/Qualidade do áudio baixa/)).toBeInTheDocument();
  });

  it('não mostra aviso de qualidade durante silêncio', () => {
    render(<VoiceCapture />);
    
    act(() => {
      const worker = new MockWorker();
      worker.onmessage?.({
        data: {
          type: 'result',
          data: {
            pitch: 0,
            clarity: 0,
            volume: 0,
            isSilence: true,
            snr: 0
          }
        }
      } as MessageEvent);
    });
    
    expect(screen.queryByText(/Qualidade do áudio baixa/)).not.toBeInTheDocument();
  });

  it('limpa recursos ao desmontar', () => {
    const { unmount } = render(<VoiceCapture />);
    unmount();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });
}); 