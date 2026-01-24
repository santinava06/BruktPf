const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Obtener configuración del usuario
export const getUserSettings = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/user-settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener configuración');
  }

  return response.json();
};

// Actualizar configuración del usuario
export const updateUserSettings = async (settings) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/user-settings`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    throw new Error('Error al actualizar configuración');
  }

  return response.json();
};