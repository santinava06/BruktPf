import express from 'express';
import { 
  getGroups, 
  createGroup, 
  getGroup, 
  updateGroup, 
  deleteGroup,
  addMember,
  removeMember
} from '../controllers/groupController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener todos los grupos del usuario
router.get('/', getGroups);

// Crear nuevo grupo
router.post('/', createGroup);

// Obtener un grupo específico
router.get('/:id', getGroup);

// Actualizar un grupo
router.put('/:id', updateGroup);

// Eliminar un grupo
router.delete('/:id', deleteGroup);

// Agregar miembro al grupo
router.post('/:id/members', addMember);

// Remover miembro del grupo
router.delete('/:id/members/:memberId', removeMember);

export default router; 