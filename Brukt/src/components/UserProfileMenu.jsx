import React, { useState } from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function UserProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate('/change-password');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.nombre) return 'U';
    return user.nombre
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          color: 'white',
          p: 0.5,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          '&.Mui-focusVisible': {
            bgcolor: 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            width: 36,
            height: 36,
            border: '2px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              border: '2px solid rgba(255, 255, 255, 0.4)',
              transform: 'scale(1.05)'
            }
          }}
        >
          {getUserInitials()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            bgcolor: 'white',
            overflow: 'hidden'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
          color: 'white'
        }}>
          <Typography variant="subtitle1" sx={{
            fontWeight: 600,
            color: 'white',
            mb: 0.5
          }}>
            {user?.nombre || 'Usuario'}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.8rem'
          }}>
            {user?.email || 'usuario@email.com'}
          </Typography>
        </Box>

        <MenuItem
          onClick={handleProfile}
          sx={{
            py: 1.5,
            px: 2.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(19, 58, 26, 0.04)'
            }
          }}
        >
          <ListItemIcon>
            <PersonIcon sx={{ color: '#133A1A', fontSize: '1.2rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Mi Perfil"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={handleSettings}
          sx={{
            py: 1.5,
            px: 2.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(19, 58, 26, 0.04)'
            }
          }}
        >
          <ListItemIcon>
            <SettingsIcon sx={{ color: '#133A1A', fontSize: '1.2rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Configuración"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={handleChangePassword}
          sx={{
            py: 1.5,
            px: 2.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(19, 58, 26, 0.04)'
            }
          }}
        >
          <ListItemIcon>
            <LockIcon sx={{ color: '#133A1A', fontSize: '1.2rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Cambiar Contraseña"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </MenuItem>

        <Divider sx={{ my: 1, mx: 2 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(211, 47, 47, 0.04)'
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#d32f2f', fontSize: '1.2rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Cerrar Sesión"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#d32f2f'
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default UserProfileMenu; 