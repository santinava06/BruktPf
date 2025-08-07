// Script para limpiar la autenticación - Ejecutar en la consola del navegador
console.log('🧹 Limpiando datos de autenticación...');

// Limpiar localStorage
localStorage.removeItem('token');
localStorage.removeItem('user');

console.log('✅ Datos de autenticación eliminados');
console.log('🔄 Redirigiendo a login...');

// Redirigir a login
window.location.href = '/login';

console.log('📝 Ahora puedes iniciar sesión nuevamente'); 