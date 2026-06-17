const express = require('express');
const discussionController = require('../controllers/discussionControllerSQLite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create discussion
router.post('/', discussionController.createDiscussion);

// Get discussions by course
router.get('/course/:course_id', discussionController.getDiscussionsByCourse);

// Get specific discussion thread
router.get('/:discussion_id', discussionController.getDiscussionThread);

// Reply to discussion
router.post('/:discussion_id/reply', discussionController.replyToDiscussion);

// Mark discussion resolved
router.put('/:discussion_id/resolve', discussionController.markResolved);

// Delete discussion
router.delete('/:discussion_id', discussionController.deleteDiscussion);

// Search discussions
router.get('/search/all', discussionController.searchDiscussions);

// Get user discussions
router.get('/user/:user_id', discussionController.getUserDiscussions);

module.exports = router;
