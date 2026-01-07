import GroupExpense from '../models/GroupExpense.js';
import ExpenseGroup from '../models/ExpenseGroup.js';
import GroupMember from '../models/GroupMember.js';
import User from '../models/user.js';
import { logActivity } from '../services/activityLogger.js';

// Obtener gastos de un grupo
export const getGroupExpenses = async (req, res) => {
  try {
    console.log('🔍 Debug - Controlador iniciado');

    const userId = req.user.userId;
    const groupId = req.params.groupId;

    console.log('🔍 Debug - Controlador recibió:', {
      userId,
      groupId,
      type: typeof groupId,
      parsed: parseInt(groupId),
      isNaN: isNaN(parseInt(groupId)),
      params: req.params,
      query: req.query
    });

    // Validar que groupId sea un número válido
    if (!groupId || isNaN(parseInt(groupId))) {
      return res.status(400).json({
        error: 'ID de grupo inválido',
        debug: {
          groupId,
          params: req.params,
          query: req.query
        }
      });
    }

    const groupIdInt = parseInt(groupId);

    console.log('🔍 Debug - Antes de verificar membresía');

    // Verificar que el usuario sea miembro del grupo
    const membership = await GroupMember.findOne({
      where: {
        group_id: groupIdInt,
        user_id: userId
      }
    });

    console.log('🔍 Debug - Membresía encontrada:', membership);

    if (!membership) {
      return res.status(403).json({
        error: 'No tienes acceso a este grupo'
      });
    }

    console.log('🔍 Debug - Antes de obtener gastos');

    // Obtener gastos del grupo
    const expenses = await GroupExpense.findAll({
      where: { group_id: groupIdInt },
      include: [
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'email', 'nombre']
        },
        {
          model: ExpenseGroup,
          as: 'group',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha', 'DESC'], ['created_at', 'DESC']]
    });

    console.log('🔍 Debug - Gastos encontrados:', expenses.length);

    res.json(expenses.map(expense => ({
      id: expense.id,
      monto: parseFloat(expense.monto),
      categoria: expense.categoria,
      descripcion: expense.descripcion,
      fecha: expense.fecha,
      paid_by: expense.paid_by,
      paid_by_email: expense.payer?.email || 'Usuario desconocido',
      paid_by_name: expense.payer?.nombre || expense.payer?.email?.split('@')[0] || 'Usuario',
      split_type: expense.split_type,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    })));

  } catch (error) {
    console.error('Error al obtener gastos del grupo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear gasto en un grupo
export const createGroupExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const { monto, categoria, descripcion, fecha, split_type } = req.body;

    // Validar datos de entrada
    if (!monto || !categoria || !fecha) {
      return res.status(400).json({
        error: 'Monto, categoría y fecha son requeridos'
      });
    }

    // Validar que el monto sea positivo
    if (monto <= 0) {
      return res.status(400).json({
        error: 'El monto debe ser mayor a 0'
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

    // Crear el gasto del grupo
    const expense = await GroupExpense.create({
      group_id: groupId,
      monto,
      categoria,
      descripcion: descripcion || '',
      fecha,
      payer_id: userId, // Usar payer_id como define el modelo
      split_type: split_type || 'equal'
    });

    // Obtener el gasto con información completa
    const expenseWithDetails = await GroupExpense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'payer',
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
      id: expenseWithDetails.id,
      monto: parseFloat(expenseWithDetails.monto),
      categoria: expenseWithDetails.categoria,
      descripcion: expenseWithDetails.descripcion,
      fecha: expenseWithDetails.fecha,
      paid_by: expenseWithDetails.paid_by,
      paid_by_email: expenseWithDetails.payer?.email || 'Usuario desconocido',
      paid_by_name: expenseWithDetails.payer?.nombre || expenseWithDetails.payer?.email?.split('@')[0] || 'Usuario',
      split_type: expenseWithDetails.split_type,
      created_at: expenseWithDetails.created_at,
      updated_at: expenseWithDetails.updated_at
    });

    // Registrar actividad
    await logActivity({
      userId,
      groupId,
      actionType: 'CREATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: expense.id,
      details: {
        amount: expense.monto,
        description: expense.descripcion,
        category: expense.categoria
      }
    });

  } catch (error) {
    console.error('Error al crear gasto del grupo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener un gasto específico del grupo
export const getGroupExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const expenseId = req.params.expenseId;

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

    // Obtener el gasto
    const expense = await GroupExpense.findOne({
      where: {
        id: expenseId,
        group_id: groupId
      },
      include: [
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'email']
        },
        {
          model: ExpenseGroup,
          as: 'group',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({
        error: 'Gasto no encontrado'
      });
    }

    res.json({
      expense: {
        id: expense.id,
        monto: parseFloat(expense.monto),
        categoria: expense.categoria,
        descripcion: expense.descripcion,
        fecha: expense.fecha,
        paid_by: expense.paid_by,
        split_type: expense.split_type,
        created_at: expense.created_at,
        updated_at: expense.updated_at,
        payer: expense.payer,
        group: expense.group
      }
    });

  } catch (error) {
    console.error('Error al obtener gasto del grupo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar gasto del grupo
export const updateGroupExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const expenseId = req.params.expenseId;
    const { monto, categoria, descripcion, fecha, split_type } = req.body;

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

    // Buscar el gasto
    const expense = await GroupExpense.findOne({
      where: {
        id: expenseId,
        group_id: groupId
      }
    });

    if (!expense) {
      return res.status(404).json({
        error: 'Gasto no encontrado'
      });
    }

    // Verificar que el usuario sea quien pagó el gasto
    if (expense.paid_by !== userId) {
      return res.status(403).json({
        error: 'Solo quien pagó puede editar el gasto'
      });
    }

    // Validar datos de entrada
    if (monto !== undefined && monto <= 0) {
      return res.status(400).json({
        error: 'El monto debe ser mayor a 0'
      });
    }

    // Actualizar el gasto
    const updateData = {};
    if (monto !== undefined) updateData.monto = monto;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (fecha !== undefined) updateData.fecha = fecha;
    if (split_type !== undefined) updateData.split_type = split_type;

    await expense.update(updateData);

    // Obtener el gasto actualizado con información completa
    const updatedExpense = await GroupExpense.findByPk(expenseId, {
      include: [
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'email']
        },
        {
          model: ExpenseGroup,
          as: 'group',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      message: 'Gasto del grupo actualizado exitosamente',
      expense: {
        id: updatedExpense.id,
        monto: parseFloat(updatedExpense.monto),
        categoria: updatedExpense.categoria,
        descripcion: updatedExpense.descripcion,
        fecha: updatedExpense.fecha,
        paid_by: updatedExpense.paid_by,
        split_type: updatedExpense.split_type,
        created_at: updatedExpense.created_at,
        updated_at: updatedExpense.updated_at,
        payer: updatedExpense.payer,
        group: updatedExpense.group
      }
    });

    // Registrar actividad
    await logActivity({
      userId,
      groupId,
      actionType: 'UPDATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: expense.id,
      details: {
        amount: updatedExpense.monto,
        description: updatedExpense.descripcion,
        category: updatedExpense.categoria
      }
    });

  } catch (error) {
    console.error('Error al actualizar gasto del grupo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar gasto del grupo
export const deleteGroupExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const expenseId = req.params.expenseId;

    console.log('🔍 Debug - Eliminando gasto:', {
      userId,
      groupId,
      expenseId
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

    // Buscar el gasto
    const expense = await GroupExpense.findOne({
      where: {
        id: expenseId,
        group_id: groupId
      }
    });

    if (!expense) {
      console.log('❌ Gasto no encontrado');
      return res.status(404).json({
        error: 'Gasto no encontrado'
      });
    }

    console.log('✅ Gasto encontrado:', {
      expenseId: expense.id,
      payerId: expense.payer_id,
      paidBy: expense.paid_by,
      userId
    });

    // Permitir que cualquier miembro del grupo pueda eliminar gastos
    // Comentado: Verificar que el usuario sea quien pagó el gasto
    // if (expense.payer_id !== userId) {
    //   console.log('❌ Usuario no es quien pagó el gasto');
    //   return res.status(403).json({ 
    //     error: 'Solo quien pagó puede eliminar el gasto' 
    //   });
    // }

    console.log('✅ Usuario puede eliminar el gasto (miembro del grupo)');

    // Eliminar el gasto
    await expense.destroy();

    console.log('✅ Gasto eliminado exitosamente');

    res.json({
      message: 'Gasto del grupo eliminado exitosamente'
    });

    // Registrar actividad
    await logActivity({
      userId,
      groupId,
      actionType: 'DELETE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: expenseId,
      details: {
        amount: expense.monto,
        description: expense.descripcion
      }
    });

  } catch (error) {
    console.error('❌ Error al eliminar gasto del grupo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas de gastos del grupo
export const getGroupExpenseStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const { startDate, endDate } = req.query;

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

    // Construir condiciones de fecha si se proporcionan
    const whereClause = { group_id: groupId };
    if (startDate && endDate) {
      whereClause.fecha = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    // Obtener total de gastos del grupo
    const totalExpenses = await GroupExpense.sum('monto', { where: whereClause });

    // Obtener gastos por categoría
    const expensesByCategory = await GroupExpense.findAll({
      where: whereClause,
      attributes: [
        'categoria',
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['categoria'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('monto')), 'DESC']]
    });

    // Obtener gastos por pagador
    const expensesByPayer = await GroupExpense.findAll({
      where: whereClause,
      attributes: [
        'paid_by',
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'email']
        }
      ],
      group: ['paid_by', 'payer.id', 'payer.email'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('monto')), 'DESC']]
    });

    res.json({
      stats: {
        total: parseFloat(totalExpenses || 0),
        byCategory: expensesByCategory.map(item => ({
          categoria: item.categoria,
          total: parseFloat(item.dataValues.total || 0),
          count: parseInt(item.dataValues.count || 0)
        })),
        byPayer: expensesByPayer.map(item => ({
          user_id: item.paid_by,
          email: item.payer.email,
          total: parseFloat(item.dataValues.total || 0),
          count: parseInt(item.dataValues.count || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del grupo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 