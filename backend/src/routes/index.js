import express from 'express';
import authRoutes from './auth.js';
import expenseRoutes from './expenses.js';
import groupRoutes from './groups.js';
import groupExpenseRoutes from './groupExpenses.js';
import invitationRoutes from './invitations.js';
import debtPaymentRoutes from './debtPayments.js';
import healthRoutes from './health.js';

const router = express.Router();

// Ruta de prueba sin autenticación
router.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente', timestamp: new Date().toISOString() });
});

// Ruta temporal para listar usuarios (solo para debugging)
router.get('/users', async (req, res) => {
  try {
    const User = (await import('../models/user.js')).default;
    const users = await User.findAll({
      attributes: ['id', 'nombre', 'email', 'created_at']
    });
    res.json({ users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Ruta para generar token de desarrollo (no expira)
router.get('/dev-token', async (req, res) => {
  try {
    const jwt = (await import('jsonwebtoken')).default;
    const User = (await import('../models/user.js')).default;
    
    // Buscar el primer usuario o crear uno de desarrollo
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        nombre: 'Dev User',
        email: 'dev@test.com',
        password: 'dev123'
      });
    }
    
    // Generar token que no expira (o expira en 1 año)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'tu_super_secreto_jwt_aqui_cambialo_en_produccion',
      { expiresIn: '365d' } // 1 año
    );
    
    res.json({
      message: 'Token de desarrollo generado',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      },
      expiresIn: '365d'
    });
  } catch (error) {
    console.error('Error al generar token de desarrollo:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de gastos individuales
router.use('/expenses', expenseRoutes);

// Rutas de grupos
router.use('/groups', groupRoutes);

// Rutas de gastos de grupos
router.use('/group-expenses', groupExpenseRoutes);

// Rutas de invitaciones
router.use('/invitations', invitationRoutes);

// Rutas de pagos de deudas
router.use('/debt-payments', debtPaymentRoutes);

// Rutas de health check
router.use('/', healthRoutes);

export default router; 