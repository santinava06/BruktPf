import express from 'express';
import {
    sendFriendRequest,
    getFriends,
    getPendingRequests,
    acceptFriendRequest,
    declineFriendship
} from '../controllers/friendController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

router.post('/request', sendFriendRequest);
router.get('/', getFriends);
router.get('/pending', getPendingRequests);
router.post('/request/:requestId/accept', acceptFriendRequest);
router.delete('/:friendshipId', declineFriendship);

export default router;
