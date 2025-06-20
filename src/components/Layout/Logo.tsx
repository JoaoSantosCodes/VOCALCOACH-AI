import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const theme = useTheme();

  const getLogoSize = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 28,
          fontSize: '1.25rem',
        };
      case 'large':
        return {
          iconSize: 48,
          fontSize: '2.5rem',
        };
      default:
        return {
          iconSize: 36,
          fontSize: '1.75rem',
        };
    }
  };

  const { iconSize, fontSize } = getLogoSize();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        color: theme.palette.primary.main,
      }}
    >
      <MusicNoteIcon
        sx={{
          fontSize: iconSize,
          color: 'inherit',
        }}
      />
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontSize,
            fontWeight: 700,
            background: theme.gradients.text,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          VocalCoach AI
        </Typography>
      )}
    </Box>
  );
};

export default Logo; 