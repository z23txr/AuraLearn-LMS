import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/AuthMiddleware.js';
import { 
    applyForEnrollment, 
    getStudentEnrollments, 
    approveEnrollment,
    getAllCoursesWithStatus,
    getInstructorApplications,
    updateProgress,
    submitAssignment,
    submitQuiz,
    gradeAssignment,
    rejectEnrollment
} from '../controllers/enrollmentController.js';

const router = express.Router();

import upload from '../middleware/upload.js';
// Student Routes
router.post('/apply', applyForEnrollment);
router.get('/student/:studentId', getStudentEnrollments);
router.get('/all-with-status', getAllCoursesWithStatus);

//  Progress 
router.post('/update-progress', protect, updateProgress);
router.post('/submit-assignment', protect, upload.single('file'), submitAssignment);
router.post('/submit-quiz', protect, submitQuiz);

// Instructor Routes
router.get('/instructor/:teacherId', getInstructorApplications);
router.put('/approve/:id', approveEnrollment);
router.delete('/reject/:id', rejectEnrollment);
router.put('/grade-assignment', protect, authorize("instructor"), gradeAssignment);

export default router;