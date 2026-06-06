import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/AuthMiddleware.js';
import { 
    applyForEnrollment, 
    getStudentEnrollments, 
    approveEnrollment,
    getAllCoursesWithStatus,
    getInstructorApplications,
    updateProgress,
    submitAssignment
} from '../controllers/enrollmentController.js';

const router = express.Router();

//  Uploads configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/submissions/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Student Routes
router.post('/apply', applyForEnrollment);
router.get('/student/:studentId', getStudentEnrollments);
router.get('/all-with-status', getAllCoursesWithStatus);

//  Progress 
router.post('/update-progress', protect, updateProgress);
router.post('/submit-assignment', protect, upload.single('file'), submitAssignment);

// Instructor Routes
router.get('/instructor/:teacherId', getInstructorApplications);
router.put('/approve/:id', approveEnrollment);

export default router;