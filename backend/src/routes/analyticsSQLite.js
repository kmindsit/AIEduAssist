const express = require('express');
const analyticsController = require('../controllers/analyticsControllerSQLite');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user analytics
router.get('/user/:user_id', analyticsController.getUserAnalytics);
router.get('/user', analyticsController.getUserAnalytics);

// Get course analytics
router.get('/course/:course_id', analyticsController.getCourseAnalytics);

// Get instructor analytics
router.get('/instructor/:instructor_id', analyticsController.getInstructorAnalytics);
router.get('/instructor', analyticsController.getInstructorAnalytics);

// Get system analytics (Admin only)
router.get('/admin/system', adminMiddleware, analyticsController.getSystemAnalytics);

// Get engagement metrics
router.get('/engagement/metrics', analyticsController.getEngagementMetrics);

module.exports = router;
