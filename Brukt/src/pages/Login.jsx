import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../hooks/useAuth';
import { login as loginService, getGoogleAuthUrl } from '../services/auth.js';
import logo from '../assets/logoSinFondo.png';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginService(formData.email, formData.password);
      login(data.user, data.token);
      navigate('/groups');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
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
          className="glass-panel"
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box className="animate-float" sx={{ mb: 2 }}>
              <img
                src={logo}
                alt="Logo"
                style={{
                  height: '100px',
                  filter: 'brightness(0) saturate(100%) invert(8%) sepia(95%) saturate(7482%) hue-rotate(120deg) brightness(95%) contrast(118%)'
                }}
              />
            </Box>
            <Typography
              variant="h3"
              className="premium-gradient-text"
              sx={{
                mb: 1,
                letterSpacing: '-0.5px'
              }}
            >
              Bienvenido
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Gestiona tus finanzas con estilo
            </Typography>
          </Box>

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
              placeholder='ejemplo@gmail.com'
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#133A1A' }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              placeholder='tu contrasenia'
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#133A1A' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'white !important' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#133A1A',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 2,
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
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleLogin}
                startIcon={<GoogleIcon />}
                sx={{
                  py: 1.5,
                  borderColor: '#dadce0',
                  color: 'white !important',
                  bgcolor: '#fff',
                  '&:hover': {
                    bgcolor: '#f8f9fa',
                    borderColor: '#dadce0'
                  }
                }}
              >
                Continuar con Google
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#133A1A',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 