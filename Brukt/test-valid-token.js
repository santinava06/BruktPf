// Script para probar con el token válido
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImVtYWlsIjoiZGVidWdAdGVzdC5jb20iLCJpYXQiOjE3NTQ0Mjc3NDIsImV4cCI6MTc1NDUxNDE0Mn0.mDXwij1xT0ZEs3314liuF0b-HTVOdS3nyynkx5oy_5M';

// Guardar el token válido en localStorage
localStorage.setItem('token', validToken);
localStorage.setItem('user', JSON.stringify({
  id: 9,
  nombre: 'Debug User',
  email: 'debug@test.com'
}));

console.log('✅ Token válido guardado en localStorage');
console.log('🔄 Recargando página...');

// Recargar la página
window.location.reload(); 