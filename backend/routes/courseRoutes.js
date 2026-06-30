import express from 'express';
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
    getRecommendedCourses,
    generateQuizWithAI,
    updateQuizzes
} from '../controllers/courseController.js';

const router = express.Router();

//  Public Routes
router.get('/', getAllCourses);
router.post('/view', trackCourseView);
router.get('/recommendations/:userId', getRecommendedCourses);
router.get('/:id', getCourseById);

//  Instructor Routes (Course Management)
router.post('/create', protect, authorize("instructor"), createCourse);
router.patch('/add-material/:id', protect, authorize("instructor"), addMaterial);
router.delete('/delete/:id', protect, authorize("instructor"), deleteCourse);
router.patch('/complete/:id', protect, authorize("instructor"), markCourseAsComplete);
router.post('/generate-quiz', protect, authorize("instructor"), generateQuizWithAI);
router.patch('/quizzes/:id', protect, authorize("instructor"), updateQuizzes);

//  Student Assessment Routes
router.post('/submit-test', protect, submitFinalTest);

//  Grading Route
router.put('/grade-test', protect, authorize("instructor"), updateStudentGrade);

export default router;