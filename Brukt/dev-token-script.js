// Script para usar el token de desarrollo (válido por 1 año)
const devToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTc1NDQyODIwNSwiZXhwIjoxNzg1OTY0MjA1fQ.hdCXOjRx9TksCfoGeHjJZX02XTbEngYz2v78YEE7W8A';

// Guardar el token de desarrollo en localStorage
localStorage.setItem('token', devToken);
localStorage.setItem('user', JSON.stringify({
  id: 1,
  nombre: 'Test User',
  email: 'test@test.com'
}));

console.log('✅ Token de desarrollo guardado (válido por 1 año)');
console.log('🔄 Recargando página...');

// Recargar la página
window.location.reload(); 