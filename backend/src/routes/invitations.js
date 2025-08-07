import express from 'express';
import { 
  sendInvitation, 
  getPendingInvitations, 
  acceptInvitation, 
  rejectInvitation 
} from '../controllers/invitationController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Enviar invitación a un grupo
router.post('/groups/:id/invite', sendInvitation);

// Obtener invitaciones pendientes del usuario
router.get('/pending', getPendingInvitations);

// Aceptar invitación
router.post('/:id/accept', acceptInvitation);

// Rechazar invitación
router.post('/:id/reject', rejectInvitation);

export default router; 