import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Login as LoginIcon, Email, Lock } from '@mui/icons-material';
import logo from '../assets/logoSinFondo.png';

function SimpleLogin() {
  const [form, setForm] = useState({ email: 'test@test.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔍 Intentando login con:', form);

    try {
      // Petición directa sin usar el servicio
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form),
      });

      console.log('📊 Status:', response.status);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📄 Response:', data);

      if (response.ok) {
        console.log('✅ Login exitoso');
        // Guardar en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Actualizar contexto
        login(data.user, data.token);
        navigate('/');
      } else {
        console.log('❌ Login fallido:', data);
        setError(data.error || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('💥 Error:', error);
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{ py: 4 }}
      >
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            width: '100%',
            maxWidth: 450,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}
        >
          <Box textAlign="center" mb={4}>
            <Box sx={{ mb: 3 }}>
              <img 
                src={logo} 
                alt="Logo" 
                style={{ 
                  height: '70px', 
                  width: 'auto',
                  marginBottom: '16px'
                }} 
              />
            </Box>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: '#2c3e50',
                mb: 1
              }}
            >
              Login Simple (Debug)
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Formulario de prueba para debugging
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              variant="outlined"
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              size="large"
              disabled={loading}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {loading ? 'Conectando...' : 'Ingresar'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default SimpleLogin; 