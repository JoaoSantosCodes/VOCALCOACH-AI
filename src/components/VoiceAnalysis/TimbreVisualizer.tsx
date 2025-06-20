import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

export interface VisualizerFeatures {
  spectralCentroid: number;
  spectralFlatness: number;
  spectralRolloff: number;
  harmonicRatio: number;
}

interface TimbreVisualizerProps {
  features?: VisualizerFeatures;
}

const TimbreVisualizer: React.FC<TimbreVisualizerProps> = ({ features = { 
  spectralCentroid: 0, 
  spectralFlatness: 0, 
  spectralRolloff: 0, 
  harmonicRatio: 0 
} }) => {
  const visualizerAnimation = useSpring({
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 300, friction: 20 }
  });

  // Normaliza os valores para uso na visualização
  const amplitude = features.spectralFlatness;
  const frequency = features.spectralCentroid / 1000;
  const timbre = features.harmonicRatio;
  const rolloff = features.spectralRolloff;

  // Calcula cores baseadas nas características
  const getVibrancyColor = (t: number) => {
    const hue = Math.min(200 + (t * 160), 360); // Varia de azul a vermelho
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Gera descrições para tooltips
  const getTimbreDescription = (t: number) => {
    if (t < 0.3) return "Som mais opaco/fechado";
    if (t < 0.6) return "Som equilibrado";
    return "Som mais brilhante/aberto";
  };

  const getAmplitudeDescription = (a: number) => {
    if (a < 0.3) return "Volume baixo";
    if (a < 0.7) return "Volume moderado";
    return "Volume alto";
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '200px',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        padding: 2,
        boxShadow: 3
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          color: 'text.secondary'
        }}
      >
        Visualizador de Timbre
      </Typography>

      <animated.div
        style={{
          ...visualizerAnimation,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* Grade de fundo */}
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" opacity="0.1" />

          {/* Círculo principal com tooltip */}
          <Tooltip title={getTimbreDescription(timbre)} placement="top">
            <animated.circle
              cx="50"
              cy="50"
              r={20 + amplitude * 15}
              fill="none"
              stroke={getVibrancyColor(timbre)}
              strokeWidth="2"
              opacity={0.5 + timbre * 0.5}
            />
          </Tooltip>

          {/* Onda de frequência com tooltip */}
          <Tooltip title={getAmplitudeDescription(amplitude)} placement="bottom">
            <animated.path
              d={`
                M 20,50 
                Q 35,${50 - frequency * 15} 50,50 
                T 80,50
              `}
              fill="none"
              stroke={getVibrancyColor(rolloff)}
              strokeWidth="2"
            />
          </Tooltip>

          {/* Indicadores de intensidade */}
          <circle
            cx="90"
            cy={100 - (amplitude * 80)}
            r="2"
            fill={getVibrancyColor(amplitude)}
          />
          <line
            x1="88"
            y1="20"
            x2="92"
            y2="20"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <line
            x1="88"
            y1="50"
            x2="92"
            y2="50"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <line
            x1="88"
            y1="80"
            x2="92"
            y2="80"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </svg>
      </animated.div>
    </Box>
  );
};

export default TimbreVisualizer; 