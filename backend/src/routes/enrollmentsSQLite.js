const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const enrollmentController = require('../controllers/enrollmentControllerSQLite');

/**
 * POST /api/enrollments
 * Enroll a student in a course
 */
router.post('/', authMiddleware, enrollmentController.enrollCourse);

/**
 * GET /api/enrollments/user/:user_id
 * Get all enrollments for a user
 */
router.get('/user/:user_id', authMiddleware, enrollmentController.getUserEnrollments);

/**
 * GET /api/enrollments/course/:course_id
 * Get all enrollments for a course
 */
router.get('/course/:course_id', authMiddleware, enrollmentController.getCourseEnrollments);

/**
 * GET /api/enrollments/:id/progress
 * Get user progress for an enrollment
 */
router.get('/:id/progress', authMiddleware, enrollmentController.getUserProgress);

/**
 * PUT /api/enrollments/:id/progress
 * Update enrollment progress
 */
router.put('/:id/progress', authMiddleware, enrollmentController.updateProgress);

/**
 * POST /api/enrollments/:id/rate
 * Rate a course
 */
router.post('/:id/rate', authMiddleware, enrollmentController.rateCourse);

/**
 * GET /api/enrollments/:id/stats
 * Get enrollment statistics
 */
router.get('/:id/stats', authMiddleware, enrollmentController.getEnrollmentStats);

/**
 * GET /api/enrollments/:user_id/learning-stats
 * Get user learning statistics
 */
router.get('/user/:user_id/learning-stats', authMiddleware, enrollmentController.getUserLearningStats);

/**
 * DELETE /api/enrollments/:id
 * Remove enrollment (unenroll)
 */
router.delete('/:id', authMiddleware, enrollmentController.unenroll);

module.exports = router;
