import express from 'express';
import upload from '../middleware/upload.js';
import { protect, authorize } from '../middleware/AuthMiddleware.js';
import { 
    createCourse, 
    addMaterial, 
    getAllCourses, 
    deleteCourse, 
    getCourseById,
    markCourseAsComplete,
    submitFinalTest,    
    updateStudentGrade,
    trackCourseView,
    getRecommendedCourses
} from '../controllers/courseController.js';

const router = express.Router();

//  Public Routes
router.get('/', getAllCourses);
router.post('/view', trackCourseView);
router.get('/recommendations/:userId', getRecommendedCourses);
router.get('/:id', getCourseById);

//  Instructor Routes (Course Management)
router.post('/create', protect, authorize("instructor"), upload.single('thumbnail'), createCourse);
router.patch('/add-material/:id', protect, authorize("instructor"), upload.single('file'), addMaterial);
router.delete('/delete/:id', protect, authorize("instructor"), deleteCourse);
router.patch('/complete/:id', protect, authorize("instructor"), markCourseAsComplete);

//  Student Assessment Routes
router.post('/submit-test', protect, upload.single('file'), submitFinalTest);

//  Grading Route
router.put('/grade-test', protect, authorize("instructor"), updateStudentGrade);

export default router;