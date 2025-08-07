import { getToken, logout, isTokenValid } from './auth';

// Determinar URL del backend
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const BASE_URL = isLocalhost 
  ? 'http://localhost:3001/api'  // Desarrollo local
  : 'https://bruktpf-backend.onrender.com/api';  // Producción (Vercel)

console.log('🌍 Entorno detectado:', isLocalhost ? 'Local' : 'Producción');
console.log('🔗 Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server');

// Debug - mostrar la URL que se está usando
console.log('🔍 Frontend Debug:');
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);
console.log('BASE_URL final:', BASE_URL);

// Función base para hacer peticiones a la API
export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  // Verificar si el token es válido
  if (!isTokenValid()) {
    logout();
    throw new Error('Token expirado o inválido');
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token inválido, hacer logout
      logout();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('Sesión expirada')) {
      // Redirigir al login
      window.location.href = '/login';
    }
    throw error;
  }
}

// Funciones específicas para expenses
export const expensesAPI = {
  getAll: () => apiRequest('/expenses'),
  create: (expense) => apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense)
  }),
  update: (id, expense) => apiRequest(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expense)
  }),
  delete: (id) => apiRequest(`/expenses/${id}`, {
    method: 'DELETE'
  })
};

// Funciones específicas para grupos
export const groupsAPI = {
  getAll: () => apiRequest('/groups'),
  create: (group) => apiRequest('/groups', {
    method: 'POST',
    body: JSON.stringify(group)
  }),
  update: (id, group) => apiRequest(`/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(group)
  }),
  delete: (id) => apiRequest(`/groups/${id}`, {
    method: 'DELETE'
  })
}; 