const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

/**
 * GET /api/admin/analytics
 * Get platform analytics
 */
router.get('/analytics', authMiddleware, adminMiddleware, adminController.getAnalytics);

/**
 * GET /api/admin/users
 * List all users with filters
 */
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);

/**
 * GET /api/admin/users/:id/details
 * Get user details with full statistics
 */
router.get('/users/:id/details', authMiddleware, adminMiddleware, adminController.getUserDetails);

/**
 * GET /api/admin/courses/stats
 * Get courses statistics
 */
router.get('/courses/stats', authMiddleware, adminMiddleware, adminController.getCoursesStats);

/**
 * GET /api/admin/engagement
 * Get engagement metrics
 */
router.get('/engagement', authMiddleware, adminMiddleware, adminController.getEngagementMetrics);

/**
 * GET /api/admin/reports
 * Generate platform reports
 */
router.get('/reports', authMiddleware, adminMiddleware, adminController.generateReports);

module.exports = router;
