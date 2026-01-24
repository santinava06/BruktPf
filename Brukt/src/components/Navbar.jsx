import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme, useMediaQuery, alpha } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logoSinFondo.png';
import UserProfileMenu from './UserProfileMenu';

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  //const theme = useTheme();
  //const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // No mostrar navbar en login/register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #133A1A 0%, #1a4d28 50%, #0f3218 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha('#4caf50', 0.2)}`,
        boxShadow: `0 2px 8px ${alpha('#000000', 0.1)}`,
        top: 0,
        zIndex: 100
      }}
    >
      <Toolbar sx={{
        minHeight: '70px !important',
        px: { xs: 2, md: 6 },
        justifyContent: 'space-between',
        gap: 2
      }}>
        {/* Logo Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'brightness(1.15)'
            }
          }}
          onClick={() => navigate('/')}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: '45px',
              marginRight: '14px',
              filter: 'brightness(0) invert(1)',
              transition: 'all 0.3s ease',
              objectFit: 'contain'
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #c8e6c9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.5px',
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Brukt
          </Typography>
        </Box>

        {/* Navigation Buttons - Only show if user is logged in */}
        {user ? (
          <Box sx={{
            display: 'flex',
            gap: { xs: 1, md: 2 },
            alignItems: 'center',
            flexWrap: 'nowrap'
          }}>
           

            {/* User Profile Menu */}
            <Box sx={{ ml: { xs: 0, md: 1 } }}>
              <UserProfileMenu />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{ 
                fontWeight: 600, 
                color: 'white !important',
                textTransform: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#4caf50 !important'
                }
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#4caf50',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                px: 3,
                py: 1,
                borderRadius: 1,
                boxShadow: `0 4px 12px ${alpha('#4caf50', 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: '#43a047',
                  boxShadow: `0 6px 16px ${alpha('#4caf50', 0.4)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Registrarse
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 