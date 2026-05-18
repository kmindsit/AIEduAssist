const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { authMiddleware, instructorMiddleware } = require('../middleware/auth');

// Get discussions for a course
router.get('/courses/:courseId', discussionController.getDiscussions);

// Get specific discussion
router.get('/:courseId/discussions/:discussionId', discussionController.getDiscussionDetails);

// Create discussion (authenticated)
router.post(
  '/courses/:courseId',
  authMiddleware,
  discussionController.createDiscussion
);

// Reply to discussion
router.post(
  '/:courseId/discussions/:discussionId/reply',
  authMiddleware,
  discussionController.replyToDiscussion
);

// Upvote discussion
router.post(
  '/:courseId/discussions/:discussionId/upvote',
  authMiddleware,
  discussionController.upvoteDiscussion
);

// Pin/unpin discussion (instructor/admin)
router.put(
  '/:courseId/discussions/:discussionId/pin',
  instructorMiddleware,
  discussionController.togglePin
);

// Lock/unlock discussion (instructor/admin)
router.put(
  '/:courseId/discussions/:discussionId/lock',
  instructorMiddleware,
  discussionController.toggleLock
);

// Delete discussion
router.delete(
  '/:courseId/discussions/:discussionId',
  authMiddleware,
  discussionController.deleteDiscussion
);

module.exports = router;
