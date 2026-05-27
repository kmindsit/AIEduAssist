const express = require('express');
const router = express.Router();
const aiTutoringController = require('../controllers/aiTutoringController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/conversations', aiTutoringController.startConversation);
router.get('/conversations/:conversationId', aiTutoringController.getConversation);
router.post('/conversations/:conversationId/message', aiTutoringController.sendMessage);
router.delete('/conversations/:conversationId', aiTutoringController.deleteConversation);
router.post('/study-guides/:courseId', aiTutoringController.generateStudyGuide);

module.exports = router;
