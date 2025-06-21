import React from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useSpring, animated } from '@react-spring/web';

interface ProgressChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  title: string;
  subtitle: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title,
  subtitle,
}) => {
  const theme = useTheme();

  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
  });

  const hoverProps = useSpring({
    scale: 1,
    config: { tension: 300, friction: 10 },
  });

  const handleHover = (isHovered: boolean) => {
    hoverProps.scale.start(isHovered ? 1.02 : 1);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: theme.typography.fontFamily,
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: theme.typography.fontFamily,
          size: 13,
        },
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <animated.div
      style={{
        ...springProps,
        transform: hoverProps.scale.to(s => `scale(${s})`),
      }}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <Box
        sx={{
          p: 3,
          height: '100%',
          minHeight: 400,
          background: theme.gradients.glass,
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'inherit',
          },
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, position: 'relative' }}>
          <Line data={data} options={chartOptions} />
        </Box>
      </Box>
    </animated.div>
  );
};

export default ProgressChart; 