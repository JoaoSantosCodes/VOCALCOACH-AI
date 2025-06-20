import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// Extend the Theme type to include our custom properties
declare module '@mui/material/styles' {
  interface Theme {
    gradients: {
      primary: string;
      secondary: string;
      text: string;
      button: string;
      buttonHover: string;
      glass: string;
      darkGlass: string;
      feature1: string;
      feature2: string;
      feature3: string;
      feature4: string;
    };
    customShadows: {
      card: string;
      primary: string;
      info: string;
      success: string;
      warning: string;
      error: string;
    };
  }
  interface ThemeOptions {
    gradients?: {
      primary: string;
      secondary: string;
      text: string;
      button: string;
      buttonHover: string;
      glass: string;
      darkGlass: string;
      feature1: string;
      feature2: string;
      feature3: string;
      feature4: string;
    };
    customShadows?: {
      card: string;
      primary: string;
      info: string;
      success: string;
      warning: string;
      error: string;
    };
  }
}

const colors = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  dark: '#0F172A',
  light: '#F8FAFC',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const shadows = {
  card: '0 8px 32px rgba(0, 0, 0, 0.15)',
  primary: '0 4px 12px rgba(124, 77, 255, 0.25)',
  info: '0 4px 12px rgba(77, 182, 255, 0.25)',
  success: '0 4px 12px rgba(77, 255, 148, 0.25)',
  warning: '0 4px 12px rgba(255, 182, 77, 0.25)',
  error: '0 4px 12px rgba(255, 77, 77, 0.25)'
};

const shadowScale = [
  'none',
  '0px 2px 4px rgba(0,0,0,0.1)',
  '0px 4px 8px rgba(0,0,0,0.12)',
  '0px 8px 16px rgba(0,0,0,0.14)',
  '0px 12px 24px rgba(0,0,0,0.16)',
  '0px 16px 32px rgba(0,0,0,0.18)',
  '0px 20px 40px rgba(0,0,0,0.20)',
  '0px 24px 48px rgba(0,0,0,0.22)',
  '0px 28px 56px rgba(0,0,0,0.24)',
  '0px 32px 64px rgba(0,0,0,0.26)',
  '0px 36px 72px rgba(0,0,0,0.28)',
  '0px 40px 80px rgba(0,0,0,0.30)',
  '0px 44px 88px rgba(0,0,0,0.32)',
  '0px 48px 96px rgba(0,0,0,0.34)',
  '0px 52px 104px rgba(0,0,0,0.36)',
  '0px 56px 112px rgba(0,0,0,0.38)',
  '0px 60px 120px rgba(0,0,0,0.40)',
  '0px 64px 128px rgba(0,0,0,0.42)',
  '0px 68px 136px rgba(0,0,0,0.44)',
  '0px 72px 144px rgba(0,0,0,0.46)',
  '0px 76px 152px rgba(0,0,0,0.48)',
  '0px 80px 160px rgba(0,0,0,0.50)',
  '0px 84px 168px rgba(0,0,0,0.52)',
  '0px 88px 176px rgba(0,0,0,0.54)',
  '0px 92px 184px rgba(0,0,0,0.56)'
] as string[];

const gradients = {
  primary: 'linear-gradient(135deg, #1E1E2E 0%, #2D2D44 100%)',
  secondary: 'linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)',
  text: 'linear-gradient(135deg, #B388FF 0%, #7C4DFF 100%)',
  button: 'linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)',
  buttonHover: 'linear-gradient(135deg, #8C5FFF 0%, #7C4DFF 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  darkGlass: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
  feature1: 'linear-gradient(135deg, #FF6B6B 0%, #FF4949 100%)',
  feature2: 'linear-gradient(135deg, #4ECDC4 0%, #2ECC71 100%)',
  feature3: 'linear-gradient(135deg, #FFD93D 0%, #FF851B 100%)',
  feature4: 'linear-gradient(135deg, #6C5CE7 0%, #A363D9 100%)'
};

// Efeitos de glass premium
const glassEffects = {
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C4DFF',
      light: '#B388FF',
      dark: '#651FFF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF4081',
      light: '#FF80AB',
      dark: '#F50057',
      contrastText: '#FFFFFF',
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
    success: {
      main: colors.success,
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  gradients,
  customShadows: shadows,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: gradients.glass,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: gradients.glass,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.dark,
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(124, 58, 237, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(124, 58, 237, 0.16)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '40px',
          color: colors.primary,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
  },
  shadows: shadowScale as Theme['shadows'],
});

export { theme, Theme }; 