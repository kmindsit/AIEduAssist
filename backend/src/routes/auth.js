const express = require('express');
const router = express.Router();
const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegister, handleValidationErrors, authController.register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validateLogin, handleValidationErrors, authController.login);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authController.refresh);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * POST /api/auth/change-password
 * Change password
 */
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
