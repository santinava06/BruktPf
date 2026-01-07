import express from 'express';
import { getGroupActivity } from '../controllers/activityController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

router.get('/:groupId', getGroupActivity);

export default router;
