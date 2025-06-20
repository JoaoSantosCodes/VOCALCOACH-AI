import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, Alert, Snackbar } from '@mui/material';
import { Mic, Stop, GraphicEq } from '@mui/icons-material';
import TimbreVisualizer from './TimbreVisualizer';

interface VoiceCaptureProps {
  onAnalysisUpdate?: (data: {
    pitch: number;
    volume: number;
    clarity: number;
  }) => void;
}

interface TimbreFeatures {
  spectralCentroid: number;
  spectralFlatness: number;
  spectralRolloff: number;
  harmonicRatio: number;
}

const VoiceCapture: React.FC<VoiceCaptureProps> = ({ onAnalysisUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [pitchLevel, setPitchLevel] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [timbreFeatures, setTimbreFeatures] = useState<TimbreFeatures | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformDataRef = useRef<Uint8Array | null>(null);
  const audioWorkerRef = useRef<Worker | null>(null);
  const timbreWorkerRef = useRef<Worker | null>(null);

  // Inicializa os Web Workers
  useEffect(() => {
    audioWorkerRef.current = new Worker(new URL('../../workers/audioAnalyzer.worker.ts', import.meta.url));
    timbreWorkerRef.current = new Worker(new URL('../../workers/timbreAnalyzer.worker.ts', import.meta.url));

    audioWorkerRef.current.onmessage = (e) => {
      if (e.data.type === 'result') {
        const { pitch, clarity, volume } = e.data.data;
        setPitchLevel(pitch);
        setClarity(clarity);
        setVolumeLevel(volume);

        if (onAnalysisUpdate) {
          onAnalysisUpdate({ pitch, clarity, volume });
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
      setVolumeLevel(0);
      setPitchLevel(0);
      setClarity(0);
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

  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Análise de Voz em Tempo Real
        </Typography>
        <IconButton
          color={isRecording ? 'error' : 'primary'}
          onClick={isRecording ? stopRecording : startRecording}
          size="large"
          disabled={permissionStatus === 'denied'}
        >
          {isRecording ? <Stop /> : <Mic />}
        </IconButton>
      </Box>

      {getPermissionMessage() && (
        <Alert severity={permissionStatus === 'denied' ? 'error' : 'info'} sx={{ mb: 2 }}>
          {getPermissionMessage()}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%'
        }}>
          {/* Canvas para forma de onda */}
          <Box sx={{
            width: '100%',
            height: 200,
            bgcolor: 'rgb(20, 20, 30)',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2
          }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          </Box>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <GraphicEq />
            <Box sx={{
              width: '100%',
              height: 10,
              bgcolor: 'grey.200',
              borderRadius: 5,
              overflow: 'hidden'
            }}>
              <Box
                sx={{
                  width: `${volumeLevel}%`,
                  height: '100%',
                  bgcolor: 'primary.main',
                  transition: 'width 0.1s ease'
                }}
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Volume: {Math.round(volumeLevel)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pitch: {Math.round(pitchLevel)}Hz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clareza: {Math.round(clarity)}%
          </Typography>
        </Box>
      </Box>

      {timbreFeatures && (
        <TimbreVisualizer features={timbreFeatures} />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VoiceCapture; 