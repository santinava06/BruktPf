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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          '&.MuiButton-contained': {
            backgroundColor: '#133A1A',
            '&:hover': {
              backgroundColor: '#1a4d2a',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#133A1A',
            color: '#133A1A',
            '&:hover': {
              backgroundColor: 'rgba(19, 58, 26, 0.04)',
            },
          },
          '&.MuiButton-text': {
            color: '#133A1A',
            '&:hover': {
              backgroundColor: 'rgba(19, 58, 26, 0.04)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.MuiIconButton-colorPrimary': {
            color: '#133A1A',
            '&:hover': {
              backgroundColor: 'rgba(19, 58, 26, 0.04)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#133A1A',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#133A1A',
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
              borderColor: '#133A1A',
            },
          },
        },
      },
    },
  },
});

export default theme; 