const express = require('express');
const router = express.Router();
const { authMiddleware, instructorMiddleware } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

/**
 * GET /api/quizzes/:quizId
 * Get quiz details
 */
router.get('/:quizId', quizController.getQuiz);

/**
 * GET /api/quizzes/course/:courseId
 * Get quizzes for a course
 */
router.get('/course/:courseId', quizController.getQuizzesByCourse);

/**
 * POST /api/quizzes/:quizId/submit
 * Submit quiz answers
 */
router.post('/:quizId/submit', authMiddleware, quizController.submitQuiz);

/**
 * POST /api/quizzes
 * Create quiz (Instructor only)
 */
router.post('/', authMiddleware, instructorMiddleware, quizController.createQuiz);

/**
 * PUT /api/quizzes/:quizId
 * Update quiz (Instructor only)
 */
router.put('/:quizId', authMiddleware, instructorMiddleware, quizController.updateQuiz);

/**
 * DELETE /api/quizzes/:quizId
 * Delete quiz (Instructor only)
 */
router.delete('/:quizId', authMiddleware, instructorMiddleware, quizController.deleteQuiz);

/**
 * POST /api/quizzes/:quizId/generate-questions
 * Generate quiz questions using AI (Instructor only)
 */
router.post('/:quizId/generate-questions', authMiddleware, instructorMiddleware, quizController.generateQuestions);

module.exports = router;
