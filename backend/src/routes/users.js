const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

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

/**
 * GET /api/users/:id
 * Get user details (Admin only)
 */
router.get('/:id', authMiddleware, adminMiddleware, userController.getUserDetails);

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

/**
 * GET /api/users/:id/stats
 * Get user statistics
 */
router.get('/:id/stats', authMiddleware, userController.getUserStats);

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

module.exports = router;
