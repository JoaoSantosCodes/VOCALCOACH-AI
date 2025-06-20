import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
} from '@mui/icons-material';
import { useSpring, animated, useTransition } from '@react-spring/web';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const theme = useTheme();

  const socialButtons = [
    {
      icon: <GoogleIcon />,
      label: 'Continuar com Google',
      color: '#EA4335',
      onClick: () => {/* Implementar login com Google */},
    },
    {
      icon: <FacebookIcon />,
      label: 'Continuar com Facebook',
      color: '#1877F2',
      onClick: () => {/* Implementar login com Facebook */},
    },
    {
      icon: <AppleIcon />,
      label: 'Continuar com Apple',
      color: '#000000',
      onClick: () => {/* Implementar login com Apple */},
    },
  ];

  const modalAnimation = useSpring({
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(20px)',
    config: { tension: 300, friction: 20 }
  });

  const buttonTransitions = useTransition(open ? socialButtons : [], {
    from: { opacity: 0, x: -20 },
    enter: item => async (next) => {
      await next({ opacity: 1, x: 0, delay: item.index * 100 });
    },
    leave: { opacity: 0, x: -20 },
  });

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: theme.customShadows.card,
          overflow: 'hidden',
        },
      }}
    >
      <animated.div style={modalAnimation}>
        <Box
          sx={{
            position: 'relative',
            p: 3,
            background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.12), transparent 70%)',
          }}
        >
          <IconButton
            onClick={onClose}
            aria-label="fechar"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>

          <DialogTitle
            sx={{
              p: 0,
              mb: 3,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{
                background: 'linear-gradient(45deg, #7C3AED, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Bem-vindo ao VocalCoach AI
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Faça login para começar sua jornada vocal
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {buttonTransitions((style, button) => (
                <animated.div style={style} key={button.label}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={button.icon}
                    onClick={button.onClick}
                    sx={{
                      py: 1.5,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'text.primary',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${button.color}20`,
                      },
                    }}
                  >
                    {button.label}
                  </Button>
                </animated.div>
              ))}
            </Box>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.875rem' }}
              >
                Ao continuar, você concorda com nossos
              </Typography>
              <Typography
                component="a"
                href="#"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Termos de Serviço
              </Typography>
            </Box>
          </DialogContent>
        </Box>
      </animated.div>
    </Dialog>
  );
};

export default LoginModal; 