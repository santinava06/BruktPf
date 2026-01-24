import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
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
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.05)',
    '0px 8px 16px rgba(0,0,0,0.05)',
    '0px 12px 24px rgba(0,0,0,0.05)',
    '0px 16px 32px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(19, 58, 26, 0.05)',
    '0px 4px 8px rgba(19, 58, 26, 0.05)',
    '0px 8px 16px rgba(19, 58, 26, 0.08)',
    ...Array(16).fill('none') // Rellenar el resto para evitar errores
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(19, 58, 26, 0.15)',
          },
          '&.MuiButton-contained': {
            background: 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #1a4d2a 0%, #0d2a12 100%)',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#133A1A',
            color: '#133A1A',
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: 'rgba(19, 58, 26, 0.04)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.03)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(19, 58, 26, 0.02)',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(19, 58, 26, 0.08)',
            },
          },
        },
      },
    },
  },
});

export default theme; 