import express from 'express';
import {
    handleStudyQuery,
    listSessions,
    getSession,
    deleteSession,
    clearChatHistory
} from '../controllers/chatController.js';
import { protect } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Send a message (creates new session if no sessionId sent)
router.post('/query', protect, handleStudyQuery);

// List all sessions for a user (metadata only)
router.get('/sessions/:userId', protect, listSessions);

// Get full messages of one session
router.get('/sessions/:userId/:sessionId', protect, getSession);

// Delete one session
router.delete('/sessions/:userId/:sessionId', protect, deleteSession);

// Clear all sessions for a user
router.delete('/history/:userId', protect, clearChatHistory);

export default router;
