import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logoSinFondo.png';
import UserProfileMenu from './UserProfileMenu';

function Navbar() {
  const { user } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // No mostrar navbar en login/register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
      }}
    >
      <Toolbar sx={{ 
        minHeight: '64px !important',
        px: { xs: 2, md: 4 },
        justifyContent: 'space-between'
      }}>
        {/* Logo Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.02)',
              filter: 'brightness(1.1)'
            }
          }}
          onClick={() => navigate('/groups')}
        >
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              height: '40px', 
              marginRight: '12px',
              filter: 'brightness(0) invert(1)',
              transition: 'all 0.3s ease'
            }} 
          />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: 'white',
              letterSpacing: '0.3px',
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            Brukt
          </Typography>
        </Box>
        
        {/* Navigation Buttons - Only show if user is logged in */}
        {user && (
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 0.5, md: 1 }, 
            alignItems: 'center',
            flexWrap: 'nowrap'
          }}>
            {/* Desktop Navigation */}
            {!isMobile && (
              <Button 
                variant="outlined"
                onClick={() => navigate('/groups')}
                sx={{ 
                  color: 'white !important',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  fontWeight: 600,
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    color: 'white !important'
                  },
                  '&.Mui-focusVisible': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    color: 'white !important'
                  },
                  '& .MuiButton-label': {
                    color: 'white !important'
                  }
                }}
              >
                Mis Grupos
              </Button>
            )}
            
            {/* Theme Toggle */}
            <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <Tooltip title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
                <IconButton
                  onClick={toggleMode}
                  sx={{
                    color: 'white',
                    ml: { xs: 0.5, md: 1 },
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(20deg)',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&:focus-visible': {
                      outline: '2px solid rgba(255, 255, 255, 0.5)',
                      outlineOffset: '2px'
                    }
                  }}
                  aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
            </Tooltip>
            
            {/* User Profile Menu */}
            <Box sx={{ ml: { xs: 0, md: 1 } }}>
              <UserProfileMenu />
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 