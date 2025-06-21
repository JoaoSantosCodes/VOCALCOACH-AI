import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useSpring, animated, config } from '@react-spring/web';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProgressChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }[];
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

  const fadeIn = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle
  });

  const titleAnimation = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay: 200,
    config: config.gentle
  });

  const subtitleAnimation = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay: 300,
    config: config.gentle
  });

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        titleFont: {
          family: theme.typography.fontFamily,
          size: 14,
          weight: 600
        },
        bodyColor: theme.palette.text.secondary,
        bodyFont: {
          family: theme.typography.fontFamily,
          size: 12,
          weight: 400
        },
        padding: 12,
        borderColor: theme.palette.divider,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
          display: false,
          drawTicks: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
          display: false,
          drawTicks: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.3
      },
      point: {
        radius: 4,
        hitRadius: 8,
        hoverRadius: 6
      }
    }
  };

  // Enhance the data with gradients and styling
  const enhancedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: index === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        if (index === 0) {
          gradient.addColorStop(0, 'rgba(124, 77, 255, 0.2)');
          gradient.addColorStop(1, 'rgba(124, 77, 255, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(255, 77, 148, 0.2)');
          gradient.addColorStop(1, 'rgba(255, 77, 148, 0)');
        }
        return gradient;
      },
      fill: true,
      pointBackgroundColor: index === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
      pointBorderColor: '#fff',
    })),
  };

  return (
    <animated.div style={fadeIn}>
      <Box
        component={motion.div}
        whileHover={{ scale: 1.01 }}
        sx={{
          p: 3,
          background: theme.gradients.glass,
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: '100%',
          minHeight: 400,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.gradients.primary,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
        }}
        data-testid="progress-chart"
      >
        <Box sx={{ mb: 3 }}>
          <animated.div style={titleAnimation}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'white',
                mb: 1,
              }}
            >
              {title}
            </Typography>
          </animated.div>

          <animated.div style={subtitleAnimation}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              {subtitle}
            </Typography>
          </animated.div>
        </Box>

        <Box sx={{ height: 300, position: 'relative' }}>
          <Line options={chartOptions} data={enhancedData} />
        </Box>
      </Box>
    </animated.div>
  );
};

export default ProgressChart; 