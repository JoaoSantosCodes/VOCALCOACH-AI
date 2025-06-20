import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useSpring, animated, config } from '@react-spring/web';

interface ExerciseAnimationProps {
  type: string;
  isPlaying: boolean;
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({ type, isPlaying }) => {
  const theme = useTheme();

  const getAnimation = () => {
    switch (type) {
      case 'breathing':
        return useSpring({
          from: { scale: 1, opacity: 0.7 },
          to: async (next) => {
            while (isPlaying) {
              await next({ scale: 1.2, opacity: 1 });
              await next({ scale: 1, opacity: 0.7 });
            }
          },
          config: { ...config.gentle, duration: 4000 }
        });

      case 'hold':
        return useSpring({
          scale: isPlaying ? 1.2 : 1,
          opacity: isPlaying ? 1 : 0.7,
          config: { tension: 300, friction: 20 }
        });

      case 'release':
        return useSpring({
          scale: isPlaying ? 1 : 1.2,
          opacity: isPlaying ? 0.7 : 1,
          config: { tension: 120, friction: 14 }
        });

      case 'lying':
        return useSpring({
          from: { rotate: 0 },
          to: async (next) => {
            while (isPlaying) {
              await next({ rotate: 5 });
              await next({ rotate: -5 });
              await next({ rotate: 0 });
            }
          },
          config: { tension: 300, friction: 10 }
        });

      case 'inhale':
        return useSpring({
          from: { y: 0, scale: 1 },
          to: async (next) => {
            while (isPlaying) {
              await next({ y: -20, scale: 1.1 });
              await next({ y: 0, scale: 1 });
            }
          },
          config: { tension: 300, friction: 10 }
        });

      case 'exhale':
        return useSpring({
          from: { y: -20, scale: 1.1 },
          to: async (next) => {
            while (isPlaying) {
              await next({ y: 0, scale: 1 });
              await next({ y: -20, scale: 1.1 });
            }
          },
          config: { tension: 300, friction: 10 }
        });

      default:
        return useSpring({});
    }
  };

  const animation = getAnimation();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        width: '100%',
        bgcolor: theme.palette.background.default,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <animated.div
        style={{
          ...animation,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <animated.div
          style={{
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.light,
            opacity: 0.5
          }}
        />
      </animated.div>
    </Box>
  );
}; 