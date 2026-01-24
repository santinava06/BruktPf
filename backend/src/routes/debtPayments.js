import express from 'express';
import {
  createDebtPayment,
  getGroupDebtPayments,
  getDebtPaymentStats,
  deleteDebtPayment
} from '../controllers/debtPaymentController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Rutas protegidas
router.post('/groups/:groupId/debt-payments', auth, createDebtPayment);
router.get('/groups/:groupId/debt-payments', auth, getGroupDebtPayments);
router.get('/groups/:groupId/debt-payments/stats', auth, getDebtPaymentStats);
router.delete('/groups/:groupId/debt-payments/:paymentId', auth, deleteDebtPayment);

export default router; 