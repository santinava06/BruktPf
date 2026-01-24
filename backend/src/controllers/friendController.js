import { Op } from 'sequelize';
import User from '../models/user.js';
import Friendship from '../models/Friendship.js';

// Enviar solicitud de amistad
export const sendFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email es requerido' });
        }

        // Buscar el usuario por email
        const friend = await User.findOne({ where: { email } });
        if (!friend) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (friend.id === userId) {
            return res.status(400).json({ error: 'No puedes enviarte una solicitud a ti mismo' });
        }

        // Verificar si ya existe una relación
        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: userId, friend_id: friend.id },
                    { user_id: friend.id, friend_id: userId }
                ]
            }
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                return res.status(400).json({ error: 'Ya son amigos' });
            }
            if (existingFriendship.status === 'pending') {
                return res.status(400).json({ error: 'Ya existe una solicitud pendiente' });
            }
        }

        // Crear solicitud
        await Friendship.create({
            user_id: userId,
            friend_id: friend.id,
            status: 'pending'
        });

        res.json({ message: 'Solicitud de amistad enviada' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener lista de amigos aceptados
export const getFriends = async (req, res) => {
    try {
        const userId = req.user.userId;

        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { user_id: userId, status: 'accepted' },
                    { friend_id: userId, status: 'accepted' }
                ]
            },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'nombre', 'email'] },
                { model: User, as: 'receiver', attributes: ['id', 'nombre', 'email'] }
            ]
        });

        const friendsList = friendships.map(f => {
            const friend = f.user_id === userId ? f.receiver : f.requester;
            return {
                id: friend.id,
                nombre: friend.nombre,
                email: friend.email,
                friendshipId: f.id
            };
        });

        res.json({ friends: friendsList });
    } catch (error) {
        console.error('Error getting friends:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener solicitudes pendientes recibidas
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const requests = await Friendship.findAll({
            where: {
                friend_id: userId,
                status: 'pending'
            },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'nombre', 'email'] }
            ]
        });

        res.json({
            requests: requests.map(r => ({
                id: r.id,
                from: r.requester,
                created_at: r.created_at
            }))
        });
    } catch (error) {
        console.error('Error getting pending requests:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Aceptar solicitud de amistad
export const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { requestId } = req.params;

        const friendship = await Friendship.findOne({
            where: {
                id: requestId,
                friend_id: userId,
                status: 'pending'
            }
        });

        if (!friendship) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        await friendship.update({ status: 'accepted' });

        res.json({ message: 'Solicitud aceptada' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Rechazar o eliminar amistad
export const declineFriendship = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendshipId } = req.params;

        const friendship = await Friendship.findOne({
            where: {
                id: friendshipId,
                [Op.or]: [
                    { user_id: userId },
                    { friend_id: userId }
                ]
            }
        });

        if (!friendship) {
            return res.status(404).json({ error: 'Amistad no encontrada' });
        }

        await friendship.destroy();

        res.json({ message: 'Amistad eliminada o solicitud rechazada' });
    } catch (error) {
        console.error('Error declining friendship:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
