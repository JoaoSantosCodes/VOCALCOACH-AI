import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Mic as MicIcon, Stop as StopIcon } from '@mui/icons-material';

const Practice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [pitchData, setPitchData] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Inicializa o contexto de áudio quando o componente é montado
    const context = new AudioContext();
    setAudioContext(context);

    return () => {
      // Limpa o contexto de áudio quando o componente é desmontado
      context.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      // Configura o analisador de áudio
      if (audioContext) {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        
        // Atualiza os dados de análise em tempo real
        const updateAnalysis = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          
          // Calcula o volume médio
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolumeLevel(average);
          
          // Simula dados de pitch (em uma implementação real, usaríamos algoritmos de detecção de pitch)
          setPitchData(Math.random() * 100);
          
          if (isRecording) {
            requestAnimationFrame(updateAnalysis);
          }
        };
        
        updateAnalysis();
      }

      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 3, sm: 6 }
      }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Prática Vocal
        </Typography>
        <Typography 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
        >
          Grave sua voz e receba feedback em tempo real
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Área de Gravação */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: { xs: 2, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: { xs: 300, sm: 400 },
              borderRadius: '16px',
            }}
          >
            <Box
              sx={{
                width: { xs: 160, sm: 200 },
                height: { xs: 160, sm: 200 },
                borderRadius: '50%',
                border: '4px solid',
                borderColor: isRecording ? 'error.main' : 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: { xs: 2, sm: 4 },
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
            >
              {isRecording && (
                <CircularProgress
                  size={isMobile ? 168 : 208}
                  thickness={2}
                  sx={{
                    position: 'absolute',
                    color: 'error.main',
                  }}
                />
              )}
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                sx={{
                  width: { xs: 120, sm: 160 },
                  height: { xs: 120, sm: 160 },
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                variant="contained"
                color={isRecording ? 'error' : 'primary'}
              >
                {isRecording ? (
                  <StopIcon sx={{ fontSize: { xs: 48, sm: 64 } }} />
                ) : (
                  <MicIcon sx={{ fontSize: { xs: 48, sm: 64 } }} />
                )}
              </Button>
            </Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"}
              sx={{ 
                fontWeight: 500,
                color: isRecording ? 'error.main' : 'text.primary' 
              }}
            >
              {isRecording ? 'Gravando...' : 'Pronto para Gravar'}
            </Typography>
          </Paper>
        </Grid>

        {/* Métricas em Tempo Real */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: '16px',
            height: '100%',
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Análise em Tempo Real
            </Typography>
            
            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle1" gutterBottom>
                Volume
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <CircularProgress
                  variant="determinate"
                  value={volumeLevel}
                  size={isMobile ? 60 : 80}
                  thickness={4}
                  sx={{ mt: 2 }}
                />
                <Typography 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    mt: 2,
                  }} 
                  color="text.secondary"
                >
                  {Math.round(volumeLevel)}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: { xs: 3, sm: 4 } }}>
              <Typography variant="subtitle1" gutterBottom>
                Afinação
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <CircularProgress
                  variant="determinate"
                  value={pitchData}
                  size={isMobile ? 60 : 80}
                  thickness={4}
                  sx={{ mt: 2 }}
                />
                <Typography 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    mt: 2,
                  }} 
                  color="text.secondary"
                >
                  {Math.round(pitchData)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Practice; 