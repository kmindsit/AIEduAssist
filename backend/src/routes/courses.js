const express = require('express');
const router = express.Router();
const { authMiddleware, instructorMiddleware, adminMiddleware } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

/**
 * GET /api/courses
 * List all courses
 */
router.get('/', courseController.getCourses);

/**
 * GET /api/courses/trending
 * Get trending courses
 */
router.get('/trending', courseController.getTrendingCourses);

/**
 * GET /api/courses/recommendations
 * Get recommended courses for user
 */
router.get('/recommendations', authMiddleware, courseController.getRecommendations);

/**
 * GET /api/courses/:id
 * Get course details
 */
router.get('/:id', courseController.getCourseDetails);

/**
 * POST /api/courses
 * Create a course (Instructor/Admin only)
 */
router.post('/', authMiddleware, instructorMiddleware, courseController.createCourse);

/**
 * PUT /api/courses/:id
 * Update a course (Instructor/Admin only)
 */
router.put('/:id', authMiddleware, instructorMiddleware, courseController.updateCourse);

/**
 * DELETE /api/courses/:id
 * Delete a course (Instructor/Admin only)
 */
router.delete('/:id', authMiddleware, instructorMiddleware, courseController.deleteCourse);

/**
 * POST /api/courses/:id/rate
 * Rate a course
 */
router.post('/:id/rate', authMiddleware, courseController.rateCourse);

module.exports = router;
