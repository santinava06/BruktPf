import { apiRequest } from './api.js';

// Enviar solicitud de amistad
export const sendFriendRequest = async (email) => {
    return await apiRequest('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ email })
    });
};

// Obtener lista de amigos
export const getFriends = async () => {
    return await apiRequest('/friends');
};

// Obtener solicitudes pendientes
export const getPendingRequests = async () => {
    return await apiRequest('/friends/pending');
};

// Aceptar solicitud
export const acceptFriendRequest = async (requestId) => {
    return await apiRequest(`/friends/request/${requestId}/accept`, {
        method: 'POST'
    });
};

// Rechazar o eliminar amistad
export const deleteFriendship = async (friendshipId) => {
    return await apiRequest(`/friends/${friendshipId}`, {
        method: 'DELETE'
    });
};
