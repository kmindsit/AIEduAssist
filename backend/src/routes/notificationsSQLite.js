const express = require('express');
const notificationController = require('../controllers/notificationControllerSQLite');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create notification (Admin only)
router.post('/', adminMiddleware, notificationController.createNotification);

// Get user notifications
router.get('/', notificationController.getUserNotifications);
router.get('/user/:user_id', notificationController.getUserNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark as read
router.put('/:notification_id/read', notificationController.markAsRead);

// Mark all as read
router.put('/read/all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notification_id', notificationController.deleteNotification);

// Bulk delete
router.post('/delete/bulk', notificationController.bulkDelete);

// Get preferences
router.get('/preferences/get', notificationController.getPreferences);

// Update preferences
router.put('/preferences/update', notificationController.updatePreferences);

module.exports = router;
