import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import VoiceCapture from '../components/VoiceAnalysis/VoiceCapture';

interface AnalysisData {
  pitch: number;
  volume: number;
  clarity: number;
}

const Practice: React.FC = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);

  const handleAnalysisUpdate = (data: AnalysisData) => {
    setCurrentAnalysis(data);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Prática Vocal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <VoiceCapture onAnalysisUpdate={handleAnalysisUpdate} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Métricas em Tempo Real
            </Typography>
            
            {currentAnalysis ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Pitch: {Math.round(currentAnalysis.pitch)}Hz
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Volume: {Math.round(currentAnalysis.volume)}%
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Clareza: {Math.round(currentAnalysis.clarity)}%
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Inicie a gravação para ver as métricas em tempo real
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Practice; 