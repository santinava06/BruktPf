const API_URL = 'http://localhost:3001/api';

// Crear pago de deuda
export async function createDebtPayment(groupId, paymentData) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const res = await fetch(`${API_URL}/debt-payments/groups/${groupId}/debt-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al crear pago de deuda');
    }

    return await res.json();
  } catch (error) {
    console.error('Error al crear pago de deuda:', error);
    throw error;
  }
}

// Eliminar pago de deuda
export async function deleteDebtPayment(groupId, paymentId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    console.log('🔄 Eliminando pago de deuda:', {
      groupId,
      paymentId,
      token: token.substring(0, 20) + '...'
    });

    const url = `${API_URL}/debt-payments/groups/${groupId}/debt-payments/${paymentId}`;
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
      console.error('❌ Error eliminando pago de deuda:', errorData);
      throw new Error(errorData.error || 'Error al eliminar pago de deuda');
    }

    const data = await res.json();
    console.log('✅ Pago de deuda eliminado:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al eliminar pago de deuda:', error);
    throw error;
  }
}

// Obtener pagos de deuda de un grupo
export async function getGroupDebtPayments(groupId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    console.log('🔄 Obteniendo pagos de deuda para grupo:', groupId);
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    console.log('📡 URL:', `${API_URL}/debt-payments/groups/${groupId}/debt-payments`);

    const res = await fetch(`${API_URL}/debt-payments/groups/${groupId}/debt-payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 Respuesta del servidor:', res.status, res.statusText);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Error en respuesta:', errorData);
      throw new Error(errorData.error || 'Error al obtener pagos de deuda');
    }

    const data = await res.json();
    console.log('✅ Pagos de deuda obtenidos:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener pagos de deuda:', error);
    throw error;
  }
}

// Obtener estadísticas de pagos de deuda
export async function getDebtPaymentStats(groupId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const res = await fetch(`${API_URL}/debt-payments/groups/${groupId}/debt-payments/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener estadísticas de pagos');
    }

    return await res.json();
  } catch (error) {
    console.error('Error al obtener estadísticas de pagos:', error);
    throw error;
  }
} 