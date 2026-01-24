import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getUserSettings, updateUserSettings } from '../controllers/userSettingsController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener configuración del usuario
router.get('/', getUserSettings);

// Actualizar configuración del usuario
router.put('/', updateUserSettings);

export default router;