import express from 'express';
import { protect } from '../middleware/AuthMiddleware.js';
import { sendMessage, getConversation, getContacts } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/conversation/:otherUserId', protect, getConversation);
router.get('/contacts', protect, getContacts);

export default router;
