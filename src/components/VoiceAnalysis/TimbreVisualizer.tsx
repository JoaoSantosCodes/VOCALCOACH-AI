import React from 'react';
import { Box, Paper, Typography, LinearProgress, useTheme } from '@mui/material';

interface TimbreFeatures {
  spectralCentroid: number;
  spectralFlatness: number;
  spectralRolloff: number;
  harmonicRatio: number;
}

interface TimbreVisualizerProps {
  features: TimbreFeatures;
}

const TimbreVisualizer: React.FC<TimbreVisualizerProps> = ({ features }) => {
  const theme = useTheme();

  // Normaliza os valores para exibição
  const normalizeValue = (value: number, min: number, max: number): number => {
    return ((value - min) / (max - min)) * 100;
  };

  // Configuração dos limites para cada característica
  const limits = {
    spectralCentroid: { min: 0, max: 5000, label: 'Brilho' },
    spectralFlatness: { min: 0, max: 1, label: 'Riqueza Harmônica' },
    spectralRolloff: { min: 0, max: 10000, label: 'Decaimento Espectral' },
    harmonicRatio: { min: 0, max: 1, label: 'Razão Harmônica' }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Análise de Timbre
      </Typography>

      {Object.entries(features).map(([key, value]) => {
        const { min, max, label } = limits[key as keyof TimbreFeatures];
        const normalizedValue = normalizeValue(value, min, max);

        return (
          <Box key={key} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(normalizedValue)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={normalizedValue}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: theme.gradients.primary
                }
              }}
            />
          </Box>
        );
      })}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Interpretação:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>
            <Typography variant="body2">
              Brilho: Indica a presença de frequências altas
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Riqueza Harmônica: Mostra a complexidade do som
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Decaimento Espectral: Indica como a energia se distribui
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Razão Harmônica: Mede a presença de harmônicos
            </Typography>
          </li>
        </Box>
      </Box>
    </Paper>
  );
};

export default TimbreVisualizer; 