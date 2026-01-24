import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isTokenValid, logout } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

function AuthGuard({ children }) {
  const { user, logout: logoutContext } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Verificar si hay un token válido
      if (!isTokenValid()) {
        // Token inválido, limpiar y redirigir al login
        logout();
        logoutContext();
        navigate('/login');
        setIsChecking(false);
        return;
      }

      // Si hay token válido pero no hay usuario en el estado,
      // esperar un poco para que el contexto se actualice
      if (!user && isTokenValid()) {
        // Dar tiempo para que el contexto se actualice después del OAuth callback
        setTimeout(() => {
          // Verificar nuevamente después del timeout
          if (!user) {
            logout();
            logoutContext();
            navigate('/login');
          }
          setIsChecking(false);
        }, 1000); // Esperar 1 segundo
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [user, logoutContext, navigate]);

  // Mostrar loading mientras se verifica la autenticación
  if (isChecking) {
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
        <div>Verificando autenticación...</div>
      </Box>
    );
  }

  // Si no hay usuario después de la verificación, no renderizar nada
  if (!user) {
    return null;
  }

  return children;
}

export default AuthGuard; 