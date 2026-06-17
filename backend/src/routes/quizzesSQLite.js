const express = require('express');
const router = express.Router();
const { authMiddleware, instructorMiddleware } = require('../middleware/auth');
const quizController = require('../controllers/quizControllerSQLite');

/**
 * POST /api/quizzes
 * Create a quiz (Instructor/Admin only)
 */
router.post('/', authMiddleware, instructorMiddleware, quizController.createQuiz);

/**
 * GET /api/quizzes/course/:course_id
 * Get all quizzes for a course
 */
router.get('/course/:course_id', quizController.getCourseQuizzes);

/**
 * GET /api/quizzes/:id
 * Get quiz details
 */
router.get('/:id', quizController.getQuizById);

/**
 * PUT /api/quizzes/:id
 * Update a quiz (Instructor/Admin only)
 */
router.put('/:id', authMiddleware, instructorMiddleware, quizController.updateQuiz);

/**
 * DELETE /api/quizzes/:id
 * Delete a quiz (Instructor/Admin only)
 */
router.delete('/:id', authMiddleware, instructorMiddleware, quizController.deleteQuiz);

/**
 * POST /api/quizzes/:id/submit
 * Submit quiz responses
 */
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);

/**
 * GET /api/quizzes/:id/attempts/:user_id
 * Get quiz attempts for a user
 */
router.get('/:id/attempts/:user_id', authMiddleware, quizController.getUserAttempts);

/**
 * GET /api/quizzes/:id/latest/:user_id
 * Get latest attempt for a user
 */
router.get('/:id/latest/:user_id', authMiddleware, quizController.getLatestAttempt);

/**
 * GET /api/quizzes/:id/results/:result_id
 * Get quiz result by ID
 */
router.get('/:id/results/:result_id', authMiddleware, quizController.getQuizResult);

/**
 * GET /api/quizzes/:id/stats
 * Get quiz statistics
 */
router.get('/:id/stats', quizController.getQuizStats);

module.exports = router;
