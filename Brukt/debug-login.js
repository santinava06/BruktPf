// Script de depuración para probar el login
const API_URL = 'http://localhost:3001/api/auth';

async function testLogin() {
  try {
    console.log('🔍 Probando login...');
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email: 'test@test.com', 
        password: 'password123' 
      }),
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📄 Response:', data);
    
    if (response.ok) {
      console.log('✅ Login exitoso');
      return data;
    } else {
      console.log('❌ Login fallido:', data);
      throw new Error(data.error || 'Login fallido');
    }
  } catch (error) {
    console.error('💥 Error:', error);
    throw error;
  }
}

// Ejecutar el test
testLogin().catch(console.error); 