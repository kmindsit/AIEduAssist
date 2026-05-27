const ConversationSQLite = require('../models/ConversationSQLite');
const ConversationHistorySQLite = require('../models/ConversationHistorySQLite');
const CourseSQLite = require('../models/CourseSQLite');
const AITutoringService = require('../services/aiTutoringService');

exports.startConversation = async (req, res) => {
  try {
    const { courseId, title } = req.body;
    const userId = req.user.id;
    if (!courseId) return res.status(400).json({ success: false, error: 'Course ID required' });
    const course = await CourseSQLite.findById(courseId);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    const conversation = await ConversationSQLite.create(userId, courseId, title);
    res.status(201).json({ success: true, message: 'Conversation started', data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await ConversationSQLite.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, error: 'Not found' });
    const messages = await ConversationHistorySQLite.findByConversation(conversationId);
    res.json({ success: true, data: { ...conversation, messages } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });
    const conversation = await ConversationSQLite.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, error: 'Not found' });
    const course = await CourseSQLite.findById(conversation.course_id);
    await ConversationHistorySQLite.create(conversationId, userId, 'user', message);
    const aiResponse = await AITutoringService.sendMessage(conversationId, message, course);
    await ConversationHistorySQLite.create(conversationId, userId, 'ai', aiResponse);
    res.json({ success: true, data: { userMessage: message, aiMessage: aiResponse } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await ConversationHistorySQLite.deleteByConversation(conversationId);
    await ConversationSQLite.delete(conversationId);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateStudyGuide = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await CourseSQLite.findById(courseId);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    const guide = await AITutoringService.generateStudyGuide(courseId, course);
    res.json({ success: true, data: { courseId, content: guide } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
