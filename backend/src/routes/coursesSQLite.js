const express = require('express');
const router = express.Router();
const { authMiddleware, instructorMiddleware } = require('../middleware/auth');
const courseController = require('../controllers/courseControllerSQLite');

/**
 * POST /api/courses
 * Create a course (Instructor/Admin only)
 */
router.post('/', authMiddleware, instructorMiddleware, courseController.createCourse);

/**
 * GET /api/courses
 * List all courses with pagination and filtering
 */
router.get('/', courseController.getAllCourses);

/**
 * GET /api/courses/popular
 * Get popular courses
 */
router.get('/popular', courseController.getPopularCourses);

/**
 * GET /api/courses/search/:query
 * Search courses by title or description
 */
router.get('/search/:query', courseController.searchCourses);

/**
 * GET /api/courses/instructor/:instructor_id
 * Get courses by instructor
 */
router.get('/instructor/:instructor_id', courseController.getCoursesByInstructor);

/**
 * GET /api/courses/:id
 * Get course details by ID
 */
router.get('/:id', courseController.getCourseById);

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

module.exports = router;
