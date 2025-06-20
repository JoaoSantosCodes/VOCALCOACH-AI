import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, IconButton, Typography, Alert, Snackbar, LinearProgress, useTheme } from '@mui/material';
import { Mic, Stop, GraphicEq, VolumeUp } from '@mui/icons-material';
import TimbreVisualizer from './TimbreVisualizer';

interface VoiceCaptureProps {
  onAnalysisUpdate?: (data: {
    pitch: number;
    volume: number;
    clarity: number;
    isSilence: boolean;
    snr: number;
  }) => void;
}

interface TimbreFeatures {
  spectralCentroid: number;
  spectralFlatness: number;
  spectralRolloff: number;
  harmonicRatio: number;
}

interface AudioMetrics {
  pitch: number;
  volume: number;
  clarity: number;
  isSilence: boolean;
  snr: number;
}

const VoiceCapture: React.FC<VoiceCaptureProps> = ({ onAnalysisUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics>({
    pitch: 0,
    volume: 0,
    clarity: 0,
    isSilence: true,
    snr: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [timbreFeatures, setTimbreFeatures] = useState<TimbreFeatures | null>(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformDataRef = useRef<Uint8Array | null>(null);
  const audioWorkerRef = useRef<Worker | null>(null);
  const timbreWorkerRef = useRef<Worker | null>(null);

  const theme = useTheme();
  const [focusVisible, setFocusVisible] = useState(false);

  // Handlers para navegação por teclado
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }, [isRecording]);

  // Inicializa os Web Workers
  useEffect(() => {
    audioWorkerRef.current = new Worker(new URL('../../workers/audioAnalyzer.worker.ts', import.meta.url));
    timbreWorkerRef.current = new Worker(new URL('../../workers/timbreAnalyzer.worker.ts', import.meta.url));

    audioWorkerRef.current.onmessage = (e) => {
      if (e.data.type === 'result') {
        const metrics: AudioMetrics = e.data.data;
        setAudioMetrics(metrics);

        // Mostra aviso se a qualidade do áudio estiver baixa
        setShowQualityWarning(metrics.snr < 10 && !metrics.isSilence);

        if (onAnalysisUpdate) {
          onAnalysisUpdate(metrics);
        }
      } else if (e.data.type === 'error') {
        setError(e.data.error);
      }
    };

    timbreWorkerRef.current.onmessage = (e) => {
      if (e.data.type === 'result') {
        setTimbreFeatures(e.data.data);
      }
    };

    return () => {
      audioWorkerRef.current?.terminate();
      timbreWorkerRef.current?.terminate();
    };
  }, [onAnalysisUpdate]);

  // Verifica permissões do microfone
  useEffect(() => {
    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const data = waveformDataRef.current;
    
    if (!canvas || !data) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpa o canvas
    ctx.fillStyle = 'rgb(20, 20, 30)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configura o estilo da linha
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#9c27b0';
    ctx.beginPath();

    // Calcula o espaçamento entre pontos
    const sliceWidth = canvas.width / data.length;
    let x = 0;

    // Desenha a forma de onda
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const startRecording = async () => {
    try {
      // Verifica se o navegador suporta as APIs necessárias
      if (!navigator.mediaDevices || !window.AudioContext) {
        throw new Error('Seu navegador não suporta as APIs de áudio necessárias.');
      }

      // Inicializa o contexto de áudio
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Solicita permissão para usar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      // Configura o analisador de áudio
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Inicializa o buffer para a forma de onda
      waveformDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      // Configura o MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();

      // Inicia a análise em tempo real
      const analyzeAudio = () => {
        if (!analyserRef.current || !audioContextRef.current || !audioWorkerRef.current) return;

        // Atualiza dados da forma de onda
        if (waveformDataRef.current) {
          analyserRef.current.getByteTimeDomainData(waveformDataRef.current);
          drawWaveform();
        }

        // Prepara dados para análise no worker
        const buffer = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buffer);

        // Envia dados para o worker
        audioWorkerRef.current.postMessage({
          type: 'analyze',
          data: {
            buffer,
            sampleRate: audioContextRef.current.sampleRate
          }
        });

        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
      setIsRecording(true);
      setError(null);

      // Inicia a análise de timbre
      analyzeTimbre();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setError(error instanceof Error ? error.message : 'Erro ao iniciar gravação');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      setIsRecording(false);
      setAudioMetrics({
        pitch: 0,
        volume: 0,
        clarity: 0,
        isSilence: true,
        snr: 0
      });
      setTimbreFeatures(null);

      // Limpa o canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  };

  const analyzeTimbre = () => {
    if (!analyserRef.current || !isRecording) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    const analyze = () => {
      if (!isRecording) return;
      
      analyser.getFloatTimeDomainData(dataArray);
      
      // Envia dados para o worker de timbre
      timbreWorkerRef.current?.postMessage({
        type: 'analyze',
        data: {
          buffer: dataArray,
          sampleRate: audioContextRef.current?.sampleRate || 44100
        }
      });
      
      setTimeout(analyze, 100); // Analisa a cada 100ms
    };
    
    analyze();
  };

  const getPermissionMessage = () => {
    switch (permissionStatus) {
      case 'denied':
        return 'Acesso ao microfone foi negado. Por favor, permita o acesso nas configurações do navegador.';
      case 'prompt':
        return 'Clique no botão do microfone para começar a análise vocal.';
      default:
        return null;
    }
  };

  const getSignalQualityColor = (snr: number): string => {
    if (snr > 20) return '#4caf50'; // Bom
    if (snr > 10) return '#ff9800'; // Médio
    return '#f44336'; // Ruim
  };

  return (
    <Box 
      sx={{ width: '100%', p: 2 }}
      role="region"
      aria-label="Análise de Voz"
    >
      <Box 
        data-testid="audio-status" 
        sx={{ display: 'none' }}
        aria-hidden="true"
      >
        {isRecording ? 'recording' : 'stopped'}
      </Box>

      {error && (
        <Alert 
          severity="error" 
          data-testid="permission-error"
          sx={{ mb: 2 }}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </Alert>
      )}

      {showQualityWarning && (
        <Alert 
          severity="warning" 
          data-testid="quality-warning"
          sx={{ mb: 2 }}
          role="alert"
          aria-live="polite"
        >
          Qualidade do áudio está baixa. Tente reduzir o ruído ambiente.
        </Alert>
      )}

      <Box 
        sx={{ display: 'flex', gap: 2, mb: 2 }}
        role="toolbar"
        aria-label="Controles de gravação"
      >
        <IconButton
          color={isRecording ? 'error' : 'primary'}
          onClick={isRecording ? stopRecording : startRecording}
          data-testid={isRecording ? 'stop-recording' : 'start-recording'}
          onKeyDown={handleKeyPress}
          aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
          aria-pressed={isRecording}
          role="switch"
          tabIndex={0}
          sx={{
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          {isRecording ? <Stop /> : <Mic />}
        </IconButton>

        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          role="status"
          aria-live="polite"
        >
          <GraphicEq color={isRecording ? 'primary' : 'disabled'} />
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="recording-feedback"
          >
            {isRecording ? 'Gravando...' : 'Pronto para gravar'}
          </Typography>
        </Box>
      </Box>

      <Box 
        sx={{ mb: 2 }}
        role="img"
        aria-label="Visualização da forma de onda"
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100px' }}
          data-testid="waveform-display"
        />
      </Box>

      <Box 
        sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
        role="meter"
        aria-label="Indicador de volume"
        aria-valuenow={audioMetrics.volume}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <VolumeUp />
        <Box
          data-testid="volume-indicator"
          sx={{
            width: '20px',
            height: `${audioMetrics.volume}%`,
            bgcolor: 'primary.main',
            transition: 'height 0.1s ease-out'
          }}
        />
      </Box>

      <Box 
        sx={{ mt: 2 }}
        role="region"
        aria-label="Métricas de áudio"
      >
        <Typography 
          variant="caption" 
          component="div" 
          data-testid="pitch-value"
          role="status"
          aria-live="polite"
        >
          Pitch: {audioMetrics.pitch.toFixed(1)}
        </Typography>
        <Typography 
          variant="caption" 
          component="div" 
          data-testid="clarity-value"
          role="status"
          aria-live="polite"
        >
          Clarity: {audioMetrics.clarity.toFixed(1)}%
        </Typography>
        <Typography 
          variant="caption" 
          component="div" 
          data-testid="snr-value"
          role="status"
          aria-live="polite"
        >
          SNR: {audioMetrics.snr.toFixed(1)} dB
        </Typography>
      </Box>

      {timbreFeatures && (
        <TimbreVisualizer 
          features={timbreFeatures} 
          data-testid="timbre-visualizer"
          aria-label="Visualizador de timbre"
          role="img"
        />
      )}
    </Box>
  );
};

export default VoiceCapture; 