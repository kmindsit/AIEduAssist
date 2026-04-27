const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

// ========================
// User Profile Routes
// ========================

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, userController.updateProfile);

// ========================
// Analytics Routes (MUST COME BEFORE :id ROUTES)
// ========================

/**
 * GET /api/users/analytics
 * Get user analytics overview
 */
router.get('/analytics', authMiddleware, userController.getUserAnalytics);

/**
 * GET /api/users/analytics/learning-path
 * Get user learning path
 */
router.get('/analytics/learning-path', authMiddleware, userController.getLearningPath);

/**
 * GET /api/users/analytics/course-progress
 * Get user course progress
 */
router.get('/analytics/course-progress', authMiddleware, userController.getCourseProgress);

/**
 * GET /api/users/analytics/quiz-performance
 * Get quiz performance
 */
router.get('/analytics/quiz-performance', authMiddleware, userController.getQuizPerformance);

/**
 * GET /api/users/analytics/enrollment-trends
 * Get enrollment trends
 */
router.get('/analytics/enrollment-trends', authMiddleware, userController.getEnrollmentTrends);

/**
 * GET /api/users/analytics/time-spent
 * Get time spent analytics
 */
router.get('/analytics/time-spent', authMiddleware, userController.getTimeSpentAnalytics);

/**
 * GET /api/users/analytics/skills
 * Get skills gained
 */
router.get('/analytics/skills', authMiddleware, userController.getSkillsGained);

/**
 * GET /api/users/analytics/certificates
 * Get certificate progress
 */
router.get('/analytics/certificates', authMiddleware, userController.getCertificateProgress);

/**
 * GET /api/users/analytics/streaks
 * Get study streaks
 */
router.get('/analytics/streaks', authMiddleware, userController.getStudyStreaks);

// ========================
// Recommendations Routes
// ========================

/**
 * GET /api/users/recommendations
 * Get course recommendations
 */
router.get('/recommendations', authMiddleware, userController.getRecommendations);

/**
 * GET /api/users/recommendations/next-courses
 * Get next recommended courses
 */
router.get('/recommendations/next-courses', authMiddleware, userController.getNextCourses);

/**
 * GET /api/users/recommendations/weak-areas
 * Get weak areas to study
 */
router.get('/recommendations/weak-areas', authMiddleware, userController.getWeakAreasToStudy);

// ========================
// Admin/General Routes
// ========================

/**
 * GET /api/users/:id/stats
 * Get user statistics
 */
router.get('/:id/stats', authMiddleware, userController.getUserStats);

/**
 * GET /api/users/:id
 * Get user details (Admin only)
 */
router.get('/:id', authMiddleware, adminMiddleware, userController.getUserDetails);

/**
 * PUT /api/users/:id/deactivate
 * Deactivate user (Admin only)
 */
router.put('/:id/deactivate', authMiddleware, adminMiddleware, userController.deactivateUser);

/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

module.exports = router;
