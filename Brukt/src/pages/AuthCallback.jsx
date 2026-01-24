import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));

          // Guardar token y usuario
          localStorage.setItem('token', token);
          login(user, token);

          // Redirigir al dashboard
          navigate('/groups', { replace: true });
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          navigate('/login', { replace: true });
        }
      } else {
        // Error en la autenticación
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        Iniciando sesión...
      </Typography>
    </Box>
  );
}

export default AuthCallback;