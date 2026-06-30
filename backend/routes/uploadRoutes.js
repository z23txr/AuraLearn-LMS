import express from 'express';
import { getUploadSignature } from '../controllers/uploadController.js';
import { protect } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Generate a secure signature for direct Cloudinary uploads from the frontend
router.get('/signature', protect, getUploadSignature);

export default router;
