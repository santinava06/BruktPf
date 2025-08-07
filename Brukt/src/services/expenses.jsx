import { getToken } from './auth';

const API_URL = 'http://localhost:3001/api/expenses';

export async function fetchExpenses() {
  try {
    const token = getToken();
    console.log('🔍 Token obtenido:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('🔍 Token completo:', token);
    
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Response status:', res.status);
    console.log('📊 Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error response:', errorText);
      throw new Error('Error al obtener gastos');
    }
    
    const data = await res.json();
    console.log('✅ Success response:', data);
    return data;
  } catch (error) {
    console.error('Error en fetchExpenses:', error);
    // Devolver array vacío en caso de error
    return { expenses: [] };
  }
}

export async function addExpense(expense) {
  try {
    const token = getToken();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Error al agregar gasto');
    return await res.json();
  } catch (error) {
    console.error('Error en addExpense:', error);
    throw error;
  }
}

export async function deleteExpense(id) {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Error al eliminar gasto');
    return await res.json();
  } catch (error) {
    console.error('Error en deleteExpense:', error);
    throw error;
  }
}

export async function updateExpense(id, expense) {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Error al actualizar gasto');
    return await res.json();
  } catch (error) {
    console.error('Error en updateExpense:', error);
    throw error;
  }
}

// Nuevas funciones para gestionar miembros
export async function getMembers(expenseId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/${expenseId}/members`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener miembros');
  return await res.json();
}

export async function addMember(expenseId, email) {
  const token = getToken();
  const res = await fetch(`${API_URL}/${expenseId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Error al agregar miembro');
  return await res.json();
}

export async function removeMember(expenseId, memberId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/${expenseId}/members/${memberId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al quitar miembro');
  return await res.json();
} 