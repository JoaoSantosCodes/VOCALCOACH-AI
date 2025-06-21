import React from 'react';
import { Box, Typography, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { useAnimations } from '../../hooks/useAnimations';
import { animated } from '@react-spring/web';

interface FeedbackMessageProps {
  type: 'loading' | 'error' | 'success' | 'info';
  title?: string;
  message: string;
  showProgress?: boolean;
  progress?: number;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  type,
  title,
  message,
  showProgress = false,
  progress = 0,
}) => {
  const { getFadeInAnimation, getProgressAnimation } = useAnimations();
  const fadeAnimation = getFadeInAnimation(200);
  const progressAnimation = getProgressAnimation(progress);

  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Box>
              {title && (
                <Typography variant="subtitle1" fontWeight="medium">
                  {title}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {message}
              </Typography>
              {showProgress && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <animated.div
                    style={{
                      height: 4,
                      backgroundColor: 'primary.main',
                      borderRadius: 2,
                      ...progressAnimation,
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'error':
      case 'success':
      case 'info':
        return (
          <Alert
            severity={type}
            sx={{
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            {title && <AlertTitle>{title}</AlertTitle>}
            <Typography variant="body2">{message}</Typography>
            {showProgress && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <animated.div
                  style={{
                    height: 4,
                    backgroundColor: type === 'error' ? '#f44336' : '#4caf50',
                    borderRadius: 2,
                    ...progressAnimation,
                  }}
                />
              </Box>
            )}
          </Alert>
        );
    }
  };

  return (
    <animated.div style={fadeAnimation}>
      <Box
        sx={{
          p: 2,
          borderRadius: 1,
          width: '100%',
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        {renderContent()}
      </Box>
    </animated.div>
  );
}; 