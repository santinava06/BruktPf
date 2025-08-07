import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/auth';

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    username: user?.username || '',
    email: user?.email || ''
  });

  // Actualizar formData cuando el usuario cambie
  useEffect(() => {
    setFormData({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      username: user?.username || '',
      email: user?.email || ''
    });
  }, [user]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      username: user?.username || '',
      email: user?.email || ''
    });
  };

  const handleSave = async () => {
    try {
      // Validar que el username esté presente
      if (!formData.username.trim()) {
        setSnackbar({
          open: true,
          message: 'El nombre de usuario es obligatorio para completar tu perfil',
          severity: 'error'
        });
        return;
      }

      // Validar formato del username
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setSnackbar({
          open: true,
          message: 'solo puede contener letras, números y guiones bajos',
          severity: 'error'
        });
        return;
      }

      if (formData.username.length < 3 || formData.username.length > 20) {
        setSnackbar({
          open: true,
          message: '',
          severity: 'error'
        });
        return;
      }

      await updateProfile(formData);
      
      // Update the user context with new data
      if (updateUser) {
        updateUser({
          ...user,
          ...formData
        });
      }
      
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Perfil actualizado correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al actualizar el perfil',
        severity: 'error'
      });
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const getUserInitials = () => {
    if (!user?.nombre && !user?.apellido) return 'U';
    const firstName = user?.nombre || '';
    const lastName = user?.apellido || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#133A1A', fontWeight: 600 }}>
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(19, 58, 26, 0.1)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(19, 58, 26, 0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#133A1A',
                  fontSize: '3rem',
                  fontWeight: 600,
                  border: '4px solid rgba(19, 58, 26, 0.1)'
                }}
              >
                {getUserInitials()}
              </Avatar>
              
              <Typography variant="h5" sx={{ mb: 1, color: '#133A1A', fontWeight: 600 }}>
                {user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.nombre || 'Usuario'}
              </Typography>
              
              {user?.username ? (
                <Typography variant="body1" sx={{ color: '#133A1A', mb: 1, fontWeight: 500 }}>
                  @{user.username}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: '#d32f2f', mb: 1, fontStyle: 'italic' }}>
                  ⚠️ Nombre de usuario no configurado
                </Typography>
              )}
              
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {user?.email || 'usuario@email.com'}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  borderColor: '#133A1A',
                  color: 'white !important',
                  '&:hover': {
                    bgcolor: 'rgba(19, 58, 26, 0.04)',
                    borderColor: '#1a4d2a'
                  }
                }}
              >
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(19, 58, 26, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: '#133A1A', fontWeight: 600 }}>
              Información Personal
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre}
                  onChange={handleInputChange('nombre')}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: '#133A1A' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#133A1A'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido}
                  onChange={handleInputChange('apellido')}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: '#133A1A' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#133A1A'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de usuario"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  disabled={!isEditing}
                  required={!user?.username}
                  helperText={!user?.username ? "*Obligatorio" : "Obligatorio"}
                  InputProps={{
                    startAdornment: <AccountCircleIcon sx={{ mr: 1, color: !user?.username ? '#d32f2f' : '#133A1A' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: !user?.username ? '#d32f2f' : '#133A1A'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: '#133A1A' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#133A1A'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fecha de Registro"
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  disabled
                  InputProps={{
                    startAdornment: <CalendarIcon sx={{ mr: 1, color: '#133A1A' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#133A1A'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    bgcolor: '#133A1A',
                    color: 'white !important',
                    '&:hover': {
                      bgcolor: '#1a4d2a',
                      color: 'white !important'
                    },
                    '& .MuiButton-label': {
                      color: 'white !important'
                    }
                  }}
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{
                    borderColor: '#d32f2f',
                    color: 'white !important',
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.04)',
                      borderColor: '#b71c1c'
                    }
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Profile; 