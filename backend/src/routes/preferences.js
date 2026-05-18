const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get preferences
router.get('/', preferenceController.getPreferences);

// Update preferences
router.put('/', preferenceController.updatePreferences);

// Toggle email notifications
router.put('/email/toggle', preferenceController.toggleEmailNotifications);

// Set quiet hours
router.put('/quiet-hours', preferenceController.setQuietHours);

// Enable notification summary
router.post('/summary/enable', preferenceController.enableNotificationSummary);

// Disable notification summary
router.post('/summary/disable', preferenceController.disableNotificationSummary);

// Reset preferences
router.post('/reset', preferenceController.resetPreferences);

module.exports = router;
