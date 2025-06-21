import React from 'react';
import { ThemeProvider, CssBaseline, Box, IconButton, Tooltip } from '@mui/material';
import { BrightnessHigh, BrightnessLow, Contrast, ContrastOutlined } from '@mui/icons-material';
import { createAppTheme } from './utils/theme';
import { useThemePreference } from './hooks/useThemePreference';
import Layout from './components/Layout';
import Routes from './Routes';

const App: React.FC = () => {
  const { mode, contrastLevel, toggleMode, toggleContrast } = useThemePreference();
  const theme = createAppTheme({ mode, contrastLevel });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1100,
            display: 'flex',
            gap: 1,
            bgcolor: 'background.paper',
            p: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
          role="toolbar"
          aria-label="Controles de acessibilidade"
        >
          <Tooltip title={`Mudar para modo ${mode === 'light' ? 'escuro' : 'claro'}`}>
            <IconButton
              onClick={toggleMode}
              color="primary"
              aria-label={`Ativar modo ${mode === 'light' ? 'escuro' : 'claro'}`}
            >
              {mode === 'light' ? <BrightnessLow /> : <BrightnessHigh />}
            </IconButton>
          </Tooltip>
          <Tooltip title={`${contrastLevel === 'normal' ? 'Aumentar' : 'Diminuir'} contraste`}>
            <IconButton
              onClick={toggleContrast}
              color="primary"
              aria-label={`${contrastLevel === 'normal' ? 'Aumentar' : 'Diminuir'} contraste`}
            >
              {contrastLevel === 'normal' ? <ContrastOutlined /> : <Contrast />}
            </IconButton>
          </Tooltip>
        </Box>
        <Layout>
          <Routes />
        </Layout>
      </Box>
    </ThemeProvider>
  );
};

export default App; 