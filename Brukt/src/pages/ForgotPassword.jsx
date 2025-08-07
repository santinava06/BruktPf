import React, { useState } from 'react';
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
  Snackbar,
  Link
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/auth';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('El email es requerido');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setSuccess(true);
      if (response.resetUrl) {
        setResetUrl(response.resetUrl);
      }
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

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
              Recuperar Contraseña
            </Typography>
          </Box>

          {!success ? (
            <>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#133A1A' }} />
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
                  {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleBackToLogin}
                  sx={{
                    py: 1.5,
                    borderColor: '#133A1A',
                    color: 'white !important',
                    '&:hover': {
                      borderColor: '#1a4d2a',
                      bgcolor: 'rgba(19, 58, 26, 0.05)'
                    }
                  }}
                >
                  Volver al Login
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
                ¡Enlace Enviado!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Si el email existe en nuestra base de datos, recibirás un enlace de recuperación.
              </Typography>
              
              {resetUrl && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Para desarrollo:</strong> Copia y pega este enlace en tu navegador:
                  </Typography>
                  <Link 
                    href={resetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {resetUrl}
                  </Link>
                </Alert>
              )}

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
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword; 