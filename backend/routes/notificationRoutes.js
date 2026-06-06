import express from 'express';
import { getUserNotifications, markAsRead, markAllRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId', getUserNotifications);
router.put('/read/:id', markAsRead);
router.put('/mark-all/:userId', markAllRead);

export default router;