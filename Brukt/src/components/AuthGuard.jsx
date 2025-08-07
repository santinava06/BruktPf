import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isTokenValid, logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

function AuthGuard({ children }) {
  const { user, logout: logoutContext } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay un token válido
    if (!isTokenValid()) {
      // Token inválido, limpiar y redirigir al login
      logout();
      logoutContext();
      navigate('/login');
      return;
    }

    // Si no hay usuario pero hay token válido, intentar obtener el usuario
    if (!user && isTokenValid()) {
      // Aquí podrías hacer una llamada a la API para obtener el usuario
      // Por ahora, redirigimos al login
      logout();
      logoutContext();
      navigate('/login');
    }
  }, [user, logoutContext, navigate]);

  // Si no hay usuario, no renderizar nada
  if (!user) {
    return null;
  }

  return children;
}

export default AuthGuard; 