const express = require('express');
const adminController = require('../controllers/adminControllerSQLite');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:user_id', adminController.getUserDetails);
router.put('/users/:user_id/role', adminController.updateUserRole);
router.put('/users/:user_id/deactivate', adminController.deactivateUser);
router.put('/users/:user_id/activate', adminController.activateUser);
router.delete('/users/:user_id', adminController.deleteUser);

// Course moderation
router.get('/courses', adminController.getAllCourses);
router.put('/courses/:course_id/unpublish', adminController.unpublishCourse);
router.delete('/courses/:course_id', adminController.deleteCourse);

// System settings
router.get('/settings', adminController.getSystemSettings);

// Reports
router.get('/reports', adminController.generateReport);

module.exports = router;
