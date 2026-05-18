const QuizSQLite = require('../models/QuizSQLite');

const quizController = {
  // Create quiz
  createQuiz: async (req, res) => {
    try {
      const { course_id, title, description, questions, passing_score, duration_minutes, retake_allowed } = req.body;

      if (!course_id || !title) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const quiz = await QuizSQLite.create({
        course_id,
        title,
        description: description || '',
        questions: questions || 10,
        passing_score: passing_score || 70,
        duration_minutes: duration_minutes || 30,
        retake_allowed: retake_allowed !== false
      });

      res.status(201).json({
        success: true,
        message: 'Quiz created',
        data: quiz
      });
    } catch (err) {
      console.error('Error creating quiz:', err);
      res.status(500).json({ success: false, message: 'Failed to create quiz' });
    }
  },

  // Get quiz by ID
  getQuizById: async (req, res) => {
    try {
      const { id } = req.params;

      const quiz = await QuizSQLite.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      const stats = await QuizSQLite.getQuizStats(id);

      res.status(200).json({
        success: true,
        message: 'Quiz retrieved',
        data: { ...quiz, ...stats }
      });
    } catch (err) {
      console.error('Error fetching quiz:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
    }
  },

  // Get course quizzes
  getCourseQuizzes: async (req, res) => {
    try {
      const { course_id } = req.params;

      const quizzes = await QuizSQLite.findByCourse(course_id);

      res.status(200).json({
        success: true,
        message: 'Quizzes retrieved',
        data: quizzes,
        count: quizzes.length
      });
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
    }
  },

  // Submit quiz
  submitQuiz: async (req, res) => {
    try {
      const { quiz_id, answers, time_spent } = req.body;
      const user_id = req.user.id;

      if (!quiz_id || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: 'Invalid submission data' });
      }

      const quiz = await QuizSQLite.findById(quiz_id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      // Simple scoring: For demo purposes, we'll calculate based on answer count
      // In production, compare with correct answers from database
      const correctAnswers = Array(quiz.questions).fill(0).map(() => Math.floor(Math.random() * 4));
      const score = await QuizSQLite.calculateScore(answers, correctAnswers);

      const result = await QuizSQLite.submitQuiz({
        user_id,
        quiz_id,
        answers,
        score,
        time_spent: time_spent || 0
      });

      const passed = score >= quiz.passing_score;

      res.status(201).json({
        success: true,
        message: `Quiz submitted - ${passed ? 'PASSED' : 'FAILED'}`,
        data: {
          ...result,
          passed,
          passingScore: quiz.passing_score
        }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      res.status(500).json({ success: false, message: 'Failed to submit quiz' });
    }
  },

  // Get user quiz attempts
  getUserAttempts: async (req, res) => {
    try {
      const { quiz_id } = req.params;
      const user_id = req.user.id;

      const attempts = await QuizSQLite.getUserQuizAttempts(user_id, quiz_id);

      res.status(200).json({
        success: true,
        message: 'Attempts retrieved',
        data: attempts,
        count: attempts.length
      });
    } catch (err) {
      console.error('Error fetching attempts:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch attempts' });
    }
  },

  // Get latest attempt
  getLatestAttempt: async (req, res) => {
    try {
      const { quiz_id } = req.params;
      const user_id = req.user.id;

      const attempt = await QuizSQLite.getLatestAttempt(user_id, quiz_id);

      if (!attempt) {
        return res.status(404).json({ success: false, message: 'No attempts found' });
      }

      res.status(200).json({
        success: true,
        message: 'Latest attempt retrieved',
        data: attempt
      });
    } catch (err) {
      console.error('Error fetching latest attempt:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch attempt' });
    }
  },

  // Get quiz result details
  getQuizResult: async (req, res) => {
    try {
      const { result_id } = req.params;

      const result = await QuizSQLite.getResult(result_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Result not found' });
      }

      // Check authorization
      if (result.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      res.status(200).json({
        success: true,
        message: 'Result retrieved',
        data: result
      });
    } catch (err) {
      console.error('Error fetching result:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch result' });
    }
  },

  // Get quiz statistics
  getQuizStats: async (req, res) => {
    try {
      const { quiz_id } = req.params;

      const stats = await QuizSQLite.getQuizStats(quiz_id);

      res.status(200).json({
        success: true,
        message: 'Stats retrieved',
        data: stats
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  },

  // Update quiz
  updateQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const quiz = await QuizSQLite.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      const updated = await QuizSQLite.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Quiz updated',
        data: updated
      });
    } catch (err) {
      console.error('Error updating quiz:', err);
      res.status(500).json({ success: false, message: 'Failed to update quiz' });
    }
  },

  // Delete quiz
  deleteQuiz: async (req, res) => {
    try {
      const { id } = req.params;

      const quiz = await QuizSQLite.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      await QuizSQLite.delete(id);

      res.status(200).json({
        success: true,
        message: 'Quiz deleted',
        data: { id }
      });
    } catch (err) {
      console.error('Error deleting quiz:', err);
      res.status(500).json({ success: false, message: 'Failed to delete quiz' });
    }
  }
};

module.exports = quizController;
