import express from 'express';
import { simplifyGroupDebts } from '../controllers/debtSimplificationController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

router.post('/simplify', simplifyGroupDebts);

export default router;
