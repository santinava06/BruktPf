import { Op } from 'sequelize';
import GroupInvitation from '../models/GroupInvitation.js';
import ExpenseGroup from '../models/ExpenseGroup.js';
import GroupMember from '../models/GroupMember.js';
import User from '../models/user.js';

// Enviar invitación a un grupo
export const sendInvitation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email es requerido' 
      });
    }

    // Verificar que el grupo existe
    const group = await ExpenseGroup.findOne({
      where: { id: groupId }
    });

    if (!group) {
      return res.status(404).json({ 
        error: 'Grupo no encontrado' 
      });
    }

    // Verificar que el usuario sea el creador
    if (group.creator_id !== userId) {
      return res.status(403).json({ 
        error: 'Solo el creador del grupo puede enviar invitaciones' 
      });
    }

    // Buscar el usuario por email
    const invitedUser = await User.findOne({ where: { email } });
    if (!invitedUser) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar que no sea el mismo usuario
    if (invitedUser.id === userId) {
      return res.status(400).json({ 
        error: 'No puedes invitarte a ti mismo' 
      });
    }

    // Verificar que no esté ya en el grupo
    const existingMember = await GroupMember.findOne({
      where: { 
        group_id: groupId,
        user_id: invitedUser.id 
      }
    });

    if (existingMember) {
      return res.status(400).json({ 
        error: 'El usuario ya es miembro del grupo' 
      });
    }

    // Verificar que no haya una invitación pendiente
    const existingInvitation = await GroupInvitation.findOne({
      where: { 
        group_id: groupId,
        invited_user_id: invitedUser.id,
        status: 'pending'
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ 
        error: 'Ya existe una invitación pendiente para este usuario' 
      });
    }

    // Crear la invitación
    const invitation = await GroupInvitation.create({
      group_id: groupId,
      invited_user_id: invitedUser.id,
      invited_by_user_id: userId,
      status: 'pending'
    });

    res.json({
      message: 'Invitación enviada exitosamente',
      invitation: {
        id: invitation.id,
        group_id: invitation.group_id,
        invited_user_id: invitation.invited_user_id,
        status: invitation.status,
        fecha_invitacion: invitation.fecha_invitacion
      }
    });

  } catch (error) {
    console.error('Error al enviar invitación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener invitaciones pendientes del usuario
export const getPendingInvitations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const invitations = await GroupInvitation.findAll({
      where: { 
        invited_user_id: userId,
        status: 'pending'
      },
      include: [
        {
          model: ExpenseGroup,
          as: 'group',
          attributes: ['id', 'nombre', 'descripcion', 'fecha_creacion']
        },
        {
          model: User,
          as: 'invitedByUser',
          attributes: ['id', 'email', 'nombre']
        }
      ],
      order: [['fecha_invitacion', 'DESC']]
    });

    res.json({
      invitations: invitations.map(invitation => ({
        id: invitation.id,
        group: invitation.group,
        invited_by: invitation.invitedByUser,
        fecha_invitacion: invitation.fecha_invitacion
      }))
    });

  } catch (error) {
    console.error('Error al obtener invitaciones:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Aceptar invitación
export const acceptInvitation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const invitationId = req.params.id;

    // Buscar la invitación
    const invitation = await GroupInvitation.findOne({
      where: { 
        id: invitationId,
        invited_user_id: userId,
        status: 'pending'
      },
      include: [
        {
          model: ExpenseGroup,
          as: 'group'
        }
      ]
    });

    if (!invitation) {
      return res.status(404).json({ 
        error: 'Invitación no encontrada o ya procesada' 
      });
    }

    // Verificar que no esté ya en el grupo
    const existingMember = await GroupMember.findOne({
      where: { 
        group_id: invitation.group_id,
        user_id: userId 
      }
    });

    if (existingMember) {
      return res.status(400).json({ 
        error: 'Ya eres miembro de este grupo' 
      });
    }

    // Actualizar la invitación como aceptada
    await invitation.update({
      status: 'accepted',
      fecha_respuesta: new Date()
    });

    // Agregar al usuario como miembro del grupo
    await GroupMember.create({
      group_id: invitation.group_id,
      user_id: userId
    });

    res.json({
      message: 'Invitación aceptada exitosamente',
      group: invitation.group
    });

  } catch (error) {
    console.error('Error al aceptar invitación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Rechazar invitación
export const rejectInvitation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const invitationId = req.params.id;

    // Buscar la invitación
    const invitation = await GroupInvitation.findOne({
      where: { 
        id: invitationId,
        invited_user_id: userId,
        status: 'pending'
      }
    });

    if (!invitation) {
      return res.status(404).json({ 
        error: 'Invitación no encontrada o ya procesada' 
      });
    }

    // Actualizar la invitación como rechazada
    await invitation.update({
      status: 'rejected',
      fecha_respuesta: new Date()
    });

    res.json({
      message: 'Invitación rechazada exitosamente'
    });

  } catch (error) {
    console.error('Error al rechazar invitación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 