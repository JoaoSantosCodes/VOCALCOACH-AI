import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: {
    value: number;
    isPositive: boolean;
  };
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, translateY: -5 }}
    >
      <Box
        sx={{
          p: 3,
          background: theme.gradients.glass,
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.gradients.secondary,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h4"
          component={motion.h4}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          sx={{
            fontWeight: 700,
            mb: 1,
            background: theme.gradients.text,
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          {value}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <Box
            component={motion.div}
            animate={{
              scale: [1, 1.2, 1],
              transition: { duration: 1, repeat: Infinity },
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: trend.isPositive ? '#4DFFA1' : '#FF4D94',
            }}
          >
            {trend.isPositive ? <TrendingUp /> : <TrendingDown />}
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: trend.isPositive ? '#4DFFA1' : '#FF4D94',
              fontWeight: 600,
            }}
          >
            {trend.value}%
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            mt: 'auto',
            fontSize: '0.875rem',
          }}
        >
          {description}
        </Typography>
      </Box>
    </motion.div>
  );
};

export default StatCard; 