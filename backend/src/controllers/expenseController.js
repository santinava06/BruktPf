import Expense from '../models/expense.js';
import User from '../models/user.js';

// Obtener todos los gastos del usuario
export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const expenses = await Expense.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ],
      order: [['fecha', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      expenses: expenses.map(expense => ({
        id: expense.id,
        monto: parseFloat(expense.monto),
        categoria: expense.categoria,
        descripcion: expense.descripcion,
        fecha: expense.fecha,
        user_id: expense.user_id,
        created_at: expense.created_at,
        updated_at: expense.updated_at,
        user: expense.user
      }))
    });

  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear nuevo gasto
export const createExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { monto, categoria, descripcion, fecha } = req.body;

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

    // Crear el gasto
    const expense = await Expense.create({
      monto,
      categoria,
      descripcion: descripcion || '',
      fecha,
      user_id: userId
    });

    // Obtener el gasto con información del usuario
    const expenseWithUser = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Gasto creado exitosamente',
      expense: {
        id: expenseWithUser.id,
        monto: parseFloat(expenseWithUser.monto),
        categoria: expenseWithUser.categoria,
        descripcion: expenseWithUser.descripcion,
        fecha: expenseWithUser.fecha,
        user_id: expenseWithUser.user_id,
        created_at: expenseWithUser.created_at,
        updated_at: expenseWithUser.updated_at,
        user: expenseWithUser.user
      }
    });

  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener un gasto específico
export const getExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;

    const expense = await Expense.findOne({
      where: { 
        id: expenseId,
        user_id: userId 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
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
        user_id: expense.user_id,
        created_at: expense.created_at,
        updated_at: expense.updated_at,
        user: expense.user
      }
    });

  } catch (error) {
    console.error('Error al obtener gasto:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar un gasto
export const updateExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;
    const { monto, categoria, descripcion, fecha } = req.body;

    // Buscar el gasto
    const expense = await Expense.findOne({
      where: { 
        id: expenseId,
        user_id: userId 
      }
    });

    if (!expense) {
      return res.status(404).json({ 
        error: 'Gasto no encontrado' 
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

    await expense.update(updateData);

    // Obtener el gasto actualizado con información del usuario
    const updatedExpense = await Expense.findByPk(expenseId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ]
    });

    res.json({
      message: 'Gasto actualizado exitosamente',
      expense: {
        id: updatedExpense.id,
        monto: parseFloat(updatedExpense.monto),
        categoria: updatedExpense.categoria,
        descripcion: updatedExpense.descripcion,
        fecha: updatedExpense.fecha,
        user_id: updatedExpense.user_id,
        created_at: updatedExpense.created_at,
        updated_at: updatedExpense.updated_at,
        user: updatedExpense.user
      }
    });

  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar un gasto
export const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;

    // Buscar el gasto
    const expense = await Expense.findOne({
      where: { 
        id: expenseId,
        user_id: userId 
      }
    });

    if (!expense) {
      return res.status(404).json({ 
        error: 'Gasto no encontrado' 
      });
    }

    // Eliminar el gasto
    await expense.destroy();

    res.json({
      message: 'Gasto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas de gastos
export const getExpenseStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    // Construir condiciones de fecha si se proporcionan
    const whereClause = { user_id: userId };
    if (startDate && endDate) {
      whereClause.fecha = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    // Obtener total de gastos
    const totalExpenses = await Expense.sum('monto', { where: whereClause });

    // Obtener gastos por categoría
    const expensesByCategory = await Expense.findAll({
      where: whereClause,
      attributes: [
        'categoria',
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['categoria'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('monto')), 'DESC']]
    });

    // Obtener gastos por mes
    const expensesByMonth = await Expense.findAll({
      where: whereClause,
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('fecha')), 'month'],
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('fecha'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('fecha')), 'DESC']]
    });

    res.json({
      stats: {
        total: parseFloat(totalExpenses || 0),
        byCategory: expensesByCategory.map(item => ({
          categoria: item.categoria,
          total: parseFloat(item.dataValues.total || 0),
          count: parseInt(item.dataValues.count || 0)
        })),
        byMonth: expensesByMonth.map(item => ({
          month: item.dataValues.month,
          total: parseFloat(item.dataValues.total || 0),
          count: parseInt(item.dataValues.count || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 