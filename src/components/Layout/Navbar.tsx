import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MusicNote as MusicNoteIcon,
  Dashboard as DashboardIcon,
  Mic as MicIcon,
  GraphicEq as GraphicEqIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/practice', label: 'Praticar', icon: <MicIcon /> },
    { path: '/karaoke', label: 'Karaokê', icon: <MusicNoteIcon /> },
    { path: '/stats', label: 'Estatísticas', icon: <GraphicEqIcon /> },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.gradients.glass,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size="small" />
          </motion.div>

          {isMobile ? (
            <>
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>

              <AnimatePresence>
                {mobileOpen && (
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: theme.gradients.glass,
                      backdropFilter: 'blur(20px)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      zIndex: 1000,
                    }}
                  >
                    <Container maxWidth="lg">
                      <Stack spacing={2} sx={{ py: 3 }}>
                        {navigationItems.map((item) => (
                          <Button
                            key={item.path}
                            component={motion.button}
                            whileHover={{ scale: 1.05, x: 10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigate(item.path)}
                            startIcon={item.icon}
                            variant={location.pathname === item.path ? 'contained' : 'text'}
                            fullWidth
                            sx={{
                              justifyContent: 'flex-start',
                              px: 2,
                              py: 1.5,
                              color: 'white',
                              background: location.pathname === item.path
                                ? theme.gradients.button
                                : 'transparent',
                              '&:hover': {
                                background: location.pathname === item.path
                                  ? theme.gradients.buttonHover
                                  : 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </Stack>
                    </Container>
                  </Box>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Stack
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              direction="row"
              spacing={1}
            >
              {navigationItems.map((item) => (
                <motion.div key={item.path} variants={itemVariants}>
                  <Tooltip title={item.label}>
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigate(item.path)}
                      startIcon={item.icon}
                      variant={location.pathname === item.path ? 'contained' : 'text'}
                      sx={{
                        px: 2,
                        py: 1,
                        color: 'white',
                        background: location.pathname === item.path
                          ? theme.gradients.button
                          : 'transparent',
                        '&:hover': {
                          background: location.pathname === item.path
                            ? theme.gradients.buttonHover
                            : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  </Tooltip>
                </motion.div>
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </AppBar>
  );
};

export default Navbar; 