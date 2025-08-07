// Determinar URL del backend para auth
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL = isLocalhost 
  ? 'http://localhost:3001/api/auth'  // Desarrollo local
  : 'https://bruktpf-backend.onrender.com/api/auth';  // Producción (Vercel)

console.log('🔐 Auth Service - Entorno detectado:', isLocalhost ? 'Local' : 'Producción');
console.log('🔐 Auth Service - API_URL:', API_URL);

export async function login(email, password) {
  try {
    console.log('🔍 Enviando petición de login a:', `${API_URL}/login`);
    console.log('📋 Datos:', { email, password });
    
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('📊 Status:', res.status);
    console.log('📋 Headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(errorData.error || 'Login fallido');
    }
    
    const data = await res.json();
    console.log('✅ Login response:', data);
    return data;
  } catch (error) {
    console.error('💥 Error en login service:', error);
    throw error;
  }
}

export async function register(nombre, apellido, email, password) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido, email, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Registro fallido');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
}

export function saveAuth({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Función para verificar si el token es válido
export function isTokenValid() {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Decodificar el token para verificar si no ha expirado
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
} 

// Función para cambiar contraseña
export async function changePassword(currentPassword, newPassword) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const res = await fetch(`${API_URL}/change-password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al cambiar contraseña');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
} 

// Función para solicitar recuperación de contraseña
export async function forgotPassword(email) {
  try {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al solicitar recuperación');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    throw error;
  }
}

// Función para resetear contraseña
export async function resetPassword(token, newPassword) {
  try {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al resetear contraseña');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    throw error;
  }
}

// Función para actualizar perfil
export async function updateProfile(profileData) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al actualizar perfil');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
} 