import express from 'express';
import { getUserSettings, updateUserSettings } from '../controllers/settingsController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getUserSettings);
router.put('/', updateUserSettings);

export default router;
