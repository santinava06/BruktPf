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
import { useAuth } from '../hooks/useAuth';
import { login as loginService } from '../services/auth';
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: '80px', 
                marginBottom: '16px',
                filter: 'brightness(0) saturate(100%) invert(8%) sepia(95%) saturate(7482%) hue-rotate(120deg) brightness(95%) contrast(118%)'
              }} 
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#133A1A',
                mb: 1
              }}
            >
              Bienvenido de vuelta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Inicia sesión en tu cuenta
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
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
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