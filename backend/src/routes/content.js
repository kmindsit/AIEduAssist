const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authMiddleware, instructorMiddleware } = require('../middleware/auth');

// Get course content
router.get('/courses/:courseId', authMiddleware, contentController.getCourseContent);

// Get specific content module
router.get('/courses/:courseId/modules/:moduleId', authMiddleware, contentController.getContentModule);

// Create content module (instructor)
router.post(
  '/courses/:courseId/modules',
  instructorMiddleware,
  contentController.createContentModule
);

// Update content module (instructor)
router.put(
  '/courses/:courseId/modules/:moduleId',
  instructorMiddleware,
  contentController.updateContentModule
);

// Publish content module (instructor)
router.post(
  '/courses/:courseId/modules/:moduleId/publish',
  instructorMiddleware,
  contentController.publishContentModule
);

// Add feedback to module
router.post(
  '/courses/:courseId/modules/:moduleId/feedback',
  authMiddleware,
  contentController.addModuleFeedback
);

// Delete content module (instructor)
router.delete(
  '/courses/:courseId/modules/:moduleId',
  instructorMiddleware,
  contentController.deleteContentModule
);

// Reorder modules (instructor)
router.post(
  '/courses/:courseId/modules/reorder',
  instructorMiddleware,
  contentController.reorderModules
);

module.exports = router;
