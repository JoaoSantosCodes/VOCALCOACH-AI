import React from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useSpring, animated } from '@react-spring/web';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  trend,
  description,
}) => {
  const theme = useTheme();

  const springProps = useSpring({
    from: { scale: 1 },
    to: { scale: 1 },
    config: { tension: 300, friction: 10 },
  });

  const hoverProps = useSpring({
    scale: 1,
    config: { tension: 300, friction: 10 },
  });

  const handleHover = (isHovered: boolean) => {
    hoverProps.scale.start(isHovered ? 1.02 : 1);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trend.isPositive ? (
            <TrendingUpIcon color="success" />
          ) : (
            <TrendingDownIcon color="error" />
          )}
          <Typography
            variant="body2"
            color={trend.isPositive ? 'success.main' : 'error.main'}
            data-testid="trend-indicator"
          >
            {trend.value}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
    </animated.div>
  );
};

export default StatCard; 