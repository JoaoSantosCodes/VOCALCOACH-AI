import { createTheme } from '@mui/material/styles';
import { Theme as MuiTheme } from '@mui/material/styles';

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

// Escala de sombras do Material-UI (25 níveis)
const shadowScale = [
  'none',                // 0
  shadows.card,          // 1
  shadows.card,          // 2
  shadows.card,          // 3
  shadows.primary,       // 4
  shadows.primary,       // 5
  shadows.primary,       // 6
  shadows.primary,       // 7
  shadows.primary,       // 8
  shadows.primary,       // 9
  shadows.primary,       // 10
  shadows.primary,       // 11
  shadows.primary,       // 12
  shadows.primary,       // 13
  shadows.primary,       // 14
  shadows.primary,       // 15
  shadows.primary,       // 16
  shadows.primary,       // 17
  shadows.primary,       // 18
  shadows.primary,       // 19
  shadows.primary,       // 20
  shadows.primary,       // 21
  shadows.primary,       // 22
  shadows.primary,       // 23
  shadows.primary        // 24
];

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
      main: '#4ECDC4',
      light: '#7FFFE4',
      dark: '#2ECC71',
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
      default: '#1E1E2E',
      paper: '#2D2D44',
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
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
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
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: gradients.button,
          '&:hover': {
            background: gradients.buttonHover,
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: gradients.glass,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
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
  shadows: shadowScale,
});

export type Theme = MuiTheme;
export default theme; 