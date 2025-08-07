import express from 'express';
import { 
  getExpenses, 
  createExpense, 
  getExpense, 
  updateExpense, 
  deleteExpense,
  getExpenseStats
} from '../controllers/expenseController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener todos los gastos del usuario
router.get('/', getExpenses);

// Obtener estadísticas de gastos
router.get('/stats', getExpenseStats);

// Obtener un gasto específico
router.get('/:id', getExpense);

// Crear nuevo gasto
router.post('/', createExpense);

// Actualizar un gasto
router.put('/:id', updateExpense);

// Eliminar un gasto
router.delete('/:id', deleteExpense);

export default router; 