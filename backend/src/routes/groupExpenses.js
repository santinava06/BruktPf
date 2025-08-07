import express from 'express';
import {
  getGroupExpenses,
  createGroupExpense,
  getGroupExpense,
  updateGroupExpense,
  deleteGroupExpense,
  getGroupExpenseStats
} from '../controllers/groupExpenseController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Middleware de logging simple
router.use((req, res, next) => {
  console.log('🚀 Petición recibida en groupExpenses router:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl
  });
  next();
});

// Todas las rutas requieren autenticación
router.use(auth);

// Middleware para extraer groupId de query params
const extractGroupId = (req, res, next) => {
  if (req.query.groupId) {
    req.params.groupId = req.query.groupId;
    console.log('🔍 Debug - groupId extraído:', req.params.groupId);
  }
  next();
};

// Ruta de prueba
router.get('/test', (req, res) => {
  console.log('✅ Ruta de prueba ejecutada');
  res.json({ message: 'Ruta de prueba funcionando', params: req.params, query: req.query });
});

// Obtener gastos de un grupo
router.get('/', extractGroupId, getGroupExpenses);

// Obtener estadísticas de gastos del grupo
router.get('/stats', extractGroupId, getGroupExpenseStats);

// Obtener un gasto específico del grupo
router.get('/:expenseId', extractGroupId, getGroupExpense);

// Crear gasto en un grupo
router.post('/', extractGroupId, createGroupExpense);

// Actualizar gasto del grupo
router.put('/:expenseId', extractGroupId, updateGroupExpense);

// Eliminar gasto del grupo
router.delete('/:expenseId', extractGroupId, deleteGroupExpense);

export default router; 