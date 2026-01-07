import DebtPayment from '../models/DebtPayment.js';
import User from '../models/user.js';
import GroupMember from '../models/GroupMember.js';
import ExpenseGroup from '../models/ExpenseGroup.js';
import { logActivity } from '../services/activityLogger.js';

// Registrar un pago de deuda
export const createDebtPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const { receiver_id, amount, description, payment_method, notes } = req.body;

    // Validar datos de entrada
    if (!receiver_id || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'ID del receptor y monto válido son requeridos'
      });
    }

    // Verificar que el usuario sea miembro del grupo
    const membership = await GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'No tienes acceso a este grupo'
      });
    }

    // Verificar que el receptor sea miembro del grupo
    const receiverMembership = await GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: receiver_id
      }
    });

    if (!receiverMembership) {
      return res.status(400).json({
        error: 'El receptor debe ser miembro del grupo'
      });
    }

    // Verificar que no se pague a sí mismo
    if (userId === receiver_id) {
      return res.status(400).json({
        error: 'No puedes pagarte a ti mismo'
      });
    }

    // Crear el pago de deuda
    const payment = await DebtPayment.create({
      group_id: groupId,
      payer_id: userId,
      receiver_id: receiver_id,
      amount: amount,
      description: description || `Pago de deuda`,
      payment_method: payment_method || 'Efectivo',
      notes: notes,
      status: 'completed'
    });

    // Obtener el pago con información completa
    const paymentWithDetails = await DebtPayment.findByPk(payment.id, {
      include: [
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'email', 'nombre']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'email', 'nombre']
        },
        {
          model: ExpenseGroup,
          as: 'group',
          attributes: ['id', 'nombre']
        }
      ]
    });

    res.status(201).json({
      message: 'Pago de deuda registrado exitosamente',
      payment: {
        id: paymentWithDetails.id,
        amount: parseFloat(paymentWithDetails.amount),
        description: paymentWithDetails.description,
        payment_method: paymentWithDetails.payment_method,
        payment_date: paymentWithDetails.payment_date,
        status: paymentWithDetails.status,
        notes: paymentWithDetails.notes,
        payer: {
          id: paymentWithDetails.payer.id,
          email: paymentWithDetails.payer.email,
          nombre: paymentWithDetails.payer.nombre
        },
        receiver: {
          id: paymentWithDetails.receiver.id,
          email: paymentWithDetails.receiver.email,
          nombre: paymentWithDetails.receiver.nombre
        },
        group: {
          id: paymentWithDetails.group.id,
          nombre: paymentWithDetails.group.nombre
        }
      }
    });

    // Registrar actividad
    await logActivity({
      userId,
      groupId,
      actionType: 'CREATE_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: {
        amount: payment.amount,
        receiverId: receiver_id,
        description: description || 'Pago de deuda'
      }
    });

  } catch (error) {
    console.error('Error al crear pago de deuda:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar un pago de deuda
export const deleteDebtPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const paymentId = req.params.paymentId;

    console.log('🔍 Debug - Eliminando pago de deuda:', {
      userId,
      groupId,
      paymentId
    });

    // Verificar que el usuario sea miembro del grupo
    const membership = await GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });

    if (!membership) {
      console.log('❌ Usuario no es miembro del grupo');
      return res.status(403).json({
        error: 'No tienes acceso a este grupo'
      });
    }

    console.log('✅ Usuario es miembro del grupo');

    // Buscar el pago de deuda
    const payment = await DebtPayment.findOne({
      where: {
        id: paymentId,
        group_id: groupId
      }
    });

    if (!payment) {
      console.log('❌ Pago de deuda no encontrado');
      return res.status(404).json({
        error: 'Pago de deuda no encontrado'
      });
    }

    console.log('✅ Pago de deuda encontrado:', {
      paymentId: payment.id,
      payerId: payment.payer_id,
      receiverId: payment.receiver_id,
      amount: payment.amount,
      userId
    });

    // Verificar que el usuario sea quien hizo el pago o tenga permisos de administrador
    // Por ahora, permitimos que cualquier miembro del grupo pueda eliminar pagos
    console.log('✅ Usuario puede eliminar el pago de deuda (miembro del grupo)');

    // Eliminar el pago de deuda
    await payment.destroy();

    console.log('✅ Pago de deuda eliminado exitosamente');

    res.json({
      message: 'Pago de deuda eliminado exitosamente',
      payment: {
        id: payment.id,
        amount: parseFloat(payment.amount),
        description: payment.description,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        status: payment.status,
        notes: payment.notes
      }
    });

    // Registrar actividad
    await logActivity({
      userId,
      groupId,
      actionType: 'DELETE_PAYMENT',
      entityType: 'PAYMENT',
      entityId: paymentId,
      details: {
        amount: payment.amount,
        description: payment.description
      }
    });

  } catch (error) {
    console.error('❌ Error al eliminar pago de deuda:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener pagos de deuda de un grupo
export const getGroupDebtPayments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;

    // Verificar que el usuario sea miembro del grupo
    const membership = await GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'No tienes acceso a este grupo'
      });
    }

    // Obtener pagos de deuda del grupo
    const payments = await DebtPayment.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'email', 'nombre']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'email', 'nombre']
        },
        {
          model: ExpenseGroup,
          as: 'group',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['payment_date', 'DESC'], ['created_at', 'DESC']]
    });

    res.json(payments.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount),
      description: payment.description,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      status: payment.status,
      notes: payment.notes,
      payer: {
        id: payment.payer.id,
        email: payment.payer.email,
        nombre: payment.payer.nombre
      },
      receiver: {
        id: payment.receiver.id,
        email: payment.receiver.email,
        nombre: payment.receiver.nombre
      },
      group: {
        id: payment.group.id,
        nombre: payment.group.nombre
      }
    })));

  } catch (error) {
    console.error('Error al obtener pagos de deuda:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas de pagos de deuda
export const getDebtPaymentStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;

    // Verificar que el usuario sea miembro del grupo
    const membership = await GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'No tienes acceso a este grupo'
      });
    }

    // Obtener total de pagos del grupo
    const totalPayments = await DebtPayment.sum('amount', {
      where: {
        group_id: groupId,
        status: 'completed'
      }
    });

    // Obtener pagos por método de pago
    const paymentsByMethod = await DebtPayment.findAll({
      where: {
        group_id: groupId,
        status: 'completed'
      },
      attributes: [
        'payment_method',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['payment_method'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('amount')), 'DESC']]
    });

    // Obtener pagos por pagador
    const paymentsByPayer = await DebtPayment.findAll({
      where: {
        group_id: groupId,
        status: 'completed'
      },
      attributes: [
        'payer_id',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'email', 'nombre']
        }
      ],
      group: ['payer_id', 'payer.id', 'payer.email', 'payer.nombre'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('amount')), 'DESC']]
    });

    res.json({
      stats: {
        total: parseFloat(totalPayments || 0),
        byMethod: paymentsByMethod.map(item => ({
          method: item.payment_method,
          total: parseFloat(item.dataValues.total || 0),
          count: parseInt(item.dataValues.count || 0)
        })),
        byPayer: paymentsByPayer.map(item => ({
          user_id: item.payer_id,
          email: item.payer.email,
          nombre: item.payer.nombre,
          total: parseFloat(item.dataValues.total || 0),
          count: parseInt(item.dataValues.count || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de pagos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 