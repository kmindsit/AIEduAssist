const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { generateQuizQuestions } = require('../config/groqAPI');

/**
 * Get quiz details
 * GET /api/quizzes/:quizId
 */
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate('courseId', 'title description');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: { quiz }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve quiz',
      statusCode: 500
    });
  }
};

/**
 * Get quizzes for a course
 * GET /api/quizzes/course/:courseId
 */
exports.getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.find({ courseId })
      .populate('courseId', 'title');

    res.status(200).json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: { quizzes }
    });
  } catch (error) {
    console.error('Get quizzes by course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve quizzes',
      statusCode: 500
    });
  }
};

/**
 * Submit quiz answers
 * POST /api/quizzes/:quizId/submit
 */
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required',
        statusCode: 400
      });
    }

    // Get quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: quiz.courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled in the course to submit this quiz',
        statusCode: 403
      });
    }

    // Calculate score
    let score = 0;
    const results = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) score++;

      results.push({
        questionId: question._id || i,
        question: question.questionText,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    }

    // Calculate percentage
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= (quiz.passingScore || 60);

    res.status(200).json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz failed. Please try again.',
      data: {
        score,
        totalQuestions: quiz.questions.length,
        percentage,
        passed,
        results
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit quiz',
      statusCode: 500
    });
  }
};

/**
 * Create quiz (Instructor only)
 * POST /api/quizzes
 */
exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, passingScore, isAssignment, questions } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!courseId || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, title, description',
        statusCode: 400
      });
    }

    // Check course exists and user is instructor
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only course instructor can create quizzes',
        statusCode: 403
      });
    }

    // Validate questions if provided
    if (questions && Array.isArray(questions)) {
      for (let q of questions) {
        if (!q.questionText || !q.correctAnswer || !q.options) {
          return res.status(400).json({
            success: false,
            error: 'Each question must have text, correctAnswer, and options',
            statusCode: 400
          });
        }
      }
    }

    // Create quiz
    const newQuiz = new Quiz({
      courseId,
      title: title.trim(),
      description: description.trim(),
      passingScore: passingScore || 60,
      isAssignment: isAssignment || false,
      questions: questions || []
    });

    await newQuiz.save();

    // Add quiz to course
    course.quizzes.push(newQuiz._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz: newQuiz }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create quiz',
      statusCode: 500
    });
  }
};

/**
 * Update quiz
 * PUT /api/quizzes/:quizId
 */
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, passingScore, questions } = req.body;
    const userId = req.user.id;

    // Get quiz and check permissions
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    // Check course and instructor
    const course = await Course.findById(quiz.courseId);

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only course instructor can update this quiz',
        statusCode: 403
      });
    }

    // Build update object
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (passingScore !== undefined) updateData.passingScore = passingScore;
    if (questions) updateData.questions = questions;

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz: updatedQuiz }
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update quiz',
      statusCode: 500
    });
  }
};

/**
 * Delete quiz
 * DELETE /api/quizzes/:quizId
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    // Check course and instructor
    const course = await Course.findById(quiz.courseId);

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only course instructor can delete this quiz',
        statusCode: 403
      });
    }

    // Remove quiz from course
    course.quizzes = course.quizzes.filter(id => id.toString() !== quizId);
    await course.save();

    // Delete quiz
    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete quiz',
      statusCode: 500
    });
  }
};

/**
 * Generate quiz questions using AI
 * POST /api/quizzes/:quizId/generate-questions
 */
exports.generateQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { topic, count } = req.body;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required',
        statusCode: 400
      });
    }

    // Get quiz and check permissions
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    // Check course and instructor
    const course = await Course.findById(quiz.courseId);

    if (course.instructor.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only course instructor can generate questions',
        statusCode: 403
      });
    }

    try {
      // Generate questions using Groq AI
      const generatedQuestions = await generateQuizQuestions(topic, count || 5);

      // Update quiz with new questions
      quiz.questions.push(...generatedQuestions);
      await quiz.save();

      res.status(200).json({
        success: true,
        message: 'Questions generated and added to quiz successfully',
        data: {
          quiz,
          generatedCount: generatedQuestions.length
        }
      });
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      res.status(500).json({
        success: false,
        error: 'Failed to generate questions using AI. Please try again.',
        statusCode: 500
      });
    }
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions',
      statusCode: 500
    });
  }
};
