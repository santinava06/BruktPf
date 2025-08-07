import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/auth';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Token de recuperación no encontrado');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al cambiar
  };

  const handleTogglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError('La nueva contraseña es requerida');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de recuperación no válido');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, formData.newPassword);
      setSuccess(true);
      
      // Limpiar formulario
      setFormData({
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Error al resetear la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          p: 2
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid rgba(19, 58, 26, 0.1)',
              bgcolor: 'background.paper',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              Token de recuperación no válido o expirado
            </Alert>
            <Button
              fullWidth
              variant="contained"
              onClick={handleBackToLogin}
              sx={{
                py: 1.5,
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
              Volver al Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid rgba(19, 58, 26, 0.1)',
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {!success ? (
            <>
              {/* Header */}
              <Box display="flex" alignItems="center" mb={3}>
                <IconButton
                  onClick={handleBackToLogin}
                  sx={{
                    mr: 2,
                    bgcolor: 'rgba(19, 58, 26, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(19, 58, 26, 0.2)'
                    }
                  }}
                >
                  <ArrowBackIcon sx={{ color: '#133A1A' }} />
                </IconButton>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#133A1A',
                  background: 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Nueva Contraseña
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Ingresa tu nueva contraseña para completar la recuperación.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#133A1A' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#133A1A' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mb: 3,
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
                  {loading ? 'Actualizando contraseña...' : 'Actualizar Contraseña'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleBackToLogin}
                  sx={{
                    py: 1.5,
                    borderColor: '#133A1A',
                    color: '#133A1A',
                    '&:hover': {
                      borderColor: '#1a4d2a',
                      bgcolor: 'rgba(19, 58, 26, 0.05)'
                    }
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </>
          ) : (
            <Box textAlign="center">
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 64, 
                  color: '#4caf50', 
                  mb: 2 
                }} 
              />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#133A1A' }}>
                ¡Contraseña Actualizada!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login en unos segundos.
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleBackToLogin}
                sx={{
                  py: 1.5,
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
                Ir al Login
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPassword; 