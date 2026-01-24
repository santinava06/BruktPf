import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

// Paleta de colores para modo claro
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#133A1A',
    light: '#1a4d2a',
    dark: '#0d2a12',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1a4d2a',
    light: '#2d5a3a',
    dark: '#0d2a12',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
  },
  warning: {
    main: '#f59e0b',
  },
  success: {
    main: '#10b981',
  },
  info: {
    main: '#133A1A',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
  },
};

// Paleta de colores para modo oscuro
const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#4ade80',
    light: '#86efac',
    dark: '#22c55e',
    contrastText: '#000000',
  },
  secondary: {
    main: '#34d399',
    light: '#6ee7b7',
    dark: '#10b981',
    contrastText: '#000000',
  },
  error: {
    main: '#ef4444',
  },
  warning: {
    main: '#fbbf24',
  },
  success: {
    main: '#22c55e',
  },
  info: {
    main: '#60a5fa',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
};

const getTheme = (mode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  return createTheme({
    palette,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            '&.MuiButton-contained': {
              backgroundColor: palette.primary.main,
              color: palette.primary.contrastText,
              '&:hover': {
                backgroundColor: palette.primary.dark,
              },
            },
            '&.MuiButton-outlined': {
              borderColor: palette.primary.main,
              color: palette.primary.main,
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(74, 222, 128, 0.08)' 
                  : 'rgba(19, 58, 26, 0.04)',
                borderColor: palette.primary.dark,
              },
            },
            '&.MuiButton-text': {
              color: palette.primary.main,
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(74, 222, 128, 0.08)' 
                  : 'rgba(19, 58, 26, 0.04)',
              },
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&.MuiIconButton-colorPrimary': {
              color: palette.primary.main,
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(74, 222, 128, 0.08)' 
                  : 'rgba(19, 58, 26, 0.04)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            '&.MuiChip-colorPrimary': {
              backgroundColor: palette.primary.main,
              color: palette.primary.contrastText,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: palette.primary.main,
              },
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: palette.primary.main,
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#133A1A',
            backgroundImage: mode === 'dark' 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
              : 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            transition: 'background-color 0.3s ease',
          },
        },
      },
    },
  });
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Leer preferencia guardada o usar preferencia del sistema
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      return savedMode;
    }
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Guardar preferencia
    localStorage.setItem('themeMode', mode);
    
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

