const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const enrollmentController = require('../controllers/enrollmentController');

/**
 * POST /api/enrollments
 * Enroll in a course
 */
router.post('/', authMiddleware, enrollmentController.enrollCourse);

/**
 * GET /api/enrollments
 * Get user's enrollments
 */
router.get('/', authMiddleware, enrollmentController.getEnrollments);

/**
 * GET /api/enrollments/stats/overview
 * Get enrollment statistics
 */
router.get('/stats/overview', authMiddleware, enrollmentController.getEnrollmentStats);

/**
 * GET /api/enrollments/:courseId
 * Get enrollment details
 */
router.get('/:courseId', authMiddleware, enrollmentController.getEnrollmentDetails);

/**
 * PUT /api/enrollments/:courseId/progress
 * Update enrollment progress
 */
router.put('/:courseId/progress', authMiddleware, enrollmentController.updateProgress);

/**
 * PUT /api/enrollments/:courseId/complete
 * Mark course as completed
 */
router.put('/:courseId/complete', authMiddleware, enrollmentController.completeCourse);

/**
 * DELETE /api/enrollments/:courseId
 * Unenroll from course
 */
router.delete('/:courseId', authMiddleware, enrollmentController.unenrollCourse);

module.exports = router;
