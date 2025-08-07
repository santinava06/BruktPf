import { Op } from 'sequelize';
import ExpenseGroup from '../models/ExpenseGroup.js';
import GroupMember from '../models/GroupMember.js';
import GroupExpense from '../models/GroupExpense.js';
import GroupInvitation from '../models/GroupInvitation.js';
import User from '../models/user.js';

// Obtener grupos del usuario
export const getGroups = async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await ExpenseGroup.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email']
        },
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      where: {
        [Op.or]: [
          { creator_id: userId },
          {
            '$members.user_id$': userId
          }
        ]
      },
      order: [['fecha_creacion', 'DESC']]
    });

    res.json({
      groups: groups.map(group => ({
        id: group.id,
        nombre: group.nombre,
        descripcion: group.descripcion,
        creator_id: group.creator_id,
        fecha_creacion: group.fecha_creacion,
        updated_at: group.updated_at,
        creator: group.creator,
        members: group.members.map(member => ({
          id: member.id,
          fecha_union: member.fecha_union,
          user: member.user
        }))
      }))
    });

  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear nuevo grupo
export const createGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombre, descripcion, memberEmails } = req.body;

    // Validar datos de entrada
    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre del grupo es requerido' 
      });
    }

    // Crear el grupo
    const group = await ExpenseGroup.create({
      nombre,
      descripcion: descripcion || '',
      creator_id: userId
    });

    // Agregar al creador como miembro
    await GroupMember.create({
      group_id: group.id,
      user_id: userId
    });

    // Agregar miembros si se proporcionan
    if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
      for (const email of memberEmails) {
        const user = await User.findOne({ where: { email } });
        if (user && user.id !== userId) {
          await GroupMember.create({
            group_id: group.id,
            user_id: user.id
          });
        }
      }
    }

    // Obtener el grupo con información completa
    const groupWithMembers = await ExpenseGroup.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email']
        },
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Grupo creado exitosamente',
      group: {
        id: groupWithMembers.id,
        nombre: groupWithMembers.nombre,
        descripcion: groupWithMembers.descripcion,
        creator_id: groupWithMembers.creator_id,
        fecha_creacion: groupWithMembers.fecha_creacion,
        updated_at: groupWithMembers.updated_at,
        creator: groupWithMembers.creator,
        members: groupWithMembers.members.map(member => ({
          id: member.id,
          fecha_union: member.fecha_union,
          user: member.user
        }))
      }
    });

  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener un grupo específico
export const getGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;

    // Verificar que el usuario tenga acceso al grupo
    const group = await ExpenseGroup.findOne({
      where: { id: groupId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email']
        },
        {
          model: GroupMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    if (!group) {
      return res.status(404).json({ 
        error: 'Grupo no encontrado' 
      });
    }

    // Verificar acceso
    const isMember = group.members.some(member => member.user_id === userId);
    const isCreator = group.creator_id === userId;

    if (!isMember && !isCreator) {
      return res.status(403).json({ 
        error: 'No tienes acceso a este grupo' 
      });
    }

    res.json({
      group: {
        id: group.id,
        nombre: group.nombre,
        descripcion: group.descripcion,
        creator_id: group.creator_id,
        fecha_creacion: group.fecha_creacion,
        updated_at: group.updated_at,
        creator: group.creator,
        members: group.members.map(member => ({
          id: member.id,
          fecha_union: member.fecha_union,
          user: member.user
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener grupo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar un grupo
export const updateGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;
    const { name, description } = req.body;

    // Buscar el grupo
    const group = await ExpenseGroup.findOne({
      where: { id: groupId }
    });

    if (!group) {
      return res.status(404).json({ 
        error: 'Grupo no encontrado' 
      });
    }

    // Verificar que el usuario sea el creador
    if (group.created_by !== userId) {
      return res.status(403).json({ 
        error: 'Solo el creador puede editar el grupo' 
      });
    }

    // Actualizar el grupo
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    await group.update(updateData);

    res.json({
      message: 'Grupo actualizado exitosamente',
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        created_by: group.created_by,
        updated_at: group.updated_at
      }
    });

  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar un grupo
export const deleteGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;

    // Buscar el grupo
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
        error: 'Solo el creador puede eliminar el grupo' 
      });
    }

    // Eliminar el grupo (las relaciones se eliminan automáticamente por CASCADE)
    await group.destroy();

    res.json({
      message: 'Grupo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Agregar miembro al grupo (ahora envía invitación)
export const addMember = async (req, res) => {
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

// Remover miembro del grupo
export const removeMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;
    const memberId = req.params.memberId;

    // Verificar que el grupo existe
    const group = await ExpenseGroup.findOne({
      where: { id: groupId }
    });

    if (!group) {
      return res.status(404).json({ 
        error: 'Grupo no encontrado' 
      });
    }

    // Verificar que el usuario sea el creador o admin
    const membership = await GroupMember.findOne({
      where: { 
        group_id: groupId,
        user_id: userId 
      }
    });

    if (!membership || (membership.role !== 'admin' && group.created_by !== userId)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para remover miembros' 
      });
    }

    // Verificar que no se esté removiendo a sí mismo
    if (memberId == userId) {
      return res.status(400).json({ 
        error: 'No puedes removerte a ti mismo' 
      });
    }

    // Buscar y eliminar el miembro
    const memberToRemove = await GroupMember.findOne({
      where: { 
        group_id: groupId,
        user_id: memberId 
      }
    });

    if (!memberToRemove) {
      return res.status(404).json({ 
        error: 'Miembro no encontrado' 
      });
    }

    await memberToRemove.destroy();

    res.json({
      message: 'Miembro removido exitosamente'
    });

  } catch (error) {
    console.error('Error al remover miembro:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 