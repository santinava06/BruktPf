import { getToken } from './auth';

const API_URL = 'http://localhost:3001/api/groups';

// Funciones para grupos
export async function createGroup(groupData) {
  const token = getToken();
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(groupData),
  });
  if (!res.ok) throw new Error('Error al crear grupo');
  return await res.json();
}

export async function getUserGroups() {
  const token = getToken();
  const res = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener grupos');
  return await res.json();
}

export async function getGroupDetails(groupId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/${groupId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener detalles del grupo');
  return await res.json();
}

// Funciones para invitaciones
export async function inviteToGroup(groupId, email) {
  const token = getToken();
  const res = await fetch(`${API_URL}/${groupId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al enviar invitación');
  }
  return await res.json();
}

export async function acceptInvitation(invitationId) {
  const token = getToken();
  const res = await fetch(`${API_URL.replace('/groups', '/invitations')}/${invitationId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al aceptar invitación');
  }
  return await res.json();
}

export async function rejectInvitation(invitationId) {
  const token = getToken();
  const res = await fetch(`${API_URL.replace('/groups', '/invitations')}/${invitationId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al rechazar invitación');
  }
  return await res.json();
}

export async function getPendingInvitations() {
  const token = getToken();
  const res = await fetch(`${API_URL.replace('/groups', '/invitations')}/pending`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener invitaciones');
  }
  return await res.json();
}

// Funciones para gastos de grupos
export async function addGroupExpense(groupId, expenseData) {
  const token = getToken();
  const res = await fetch(`${API_URL.replace('/groups', '/group-expenses')}?groupId=${groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(expenseData),
  });
  if (!res.ok) throw new Error('Error al agregar gasto al grupo');
  return await res.json();
}

export async function getGroupExpenses(groupId) {
  const token = getToken();
  const res = await fetch(`${API_URL.replace('/groups', '/group-expenses')}?groupId=${groupId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    console.error('Error response:', res.status, res.statusText);
    // Si es un error 400 (Bad Request), devolver array vacío
    if (res.status === 400) {
      return [];
    }
    throw new Error('Error al obtener gastos del grupo');
  }
  const data = await res.json();
  // Asegurar que siempre devolvemos un array
  return Array.isArray(data) ? data : [];
}

export async function deleteGroupExpense(groupId, expenseId) {
  const token = getToken();
  
  console.log('🔄 Eliminando gasto:', {
    groupId,
    expenseId,
    token: token.substring(0, 20) + '...'
  });
  
  const url = `${API_URL.replace('/groups', '/group-expenses')}/${expenseId}?groupId=${groupId}`;
  console.log('📡 URL:', url);
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('📡 Respuesta:', res.status, res.statusText);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('❌ Error eliminando gasto:', errorData);
    throw new Error(errorData.error || 'Error al eliminar gasto del grupo');
  }
  
  const data = await res.json();
  console.log('✅ Gasto eliminado:', data);
  return data;
}

export async function deleteGroup(groupId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/${groupId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar grupo');
  }
  return await res.json();
} 