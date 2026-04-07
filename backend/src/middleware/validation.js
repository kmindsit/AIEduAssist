const { body, validationResult, param, query } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      statusCode: 400,
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// ========================
// Auth Validation Rules
// ========================

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Invalid role')
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// ========================
// User Validation Rules
// ========================

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Invalid phone number'),
  body('location')
    .optional()
    .trim(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters')
];

// ========================
// Course Validation Rules
// ========================

const validateCreateCourse = [
  body('title')
    .trim()
    .notEmpty().withMessage('Course title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('level')
    .notEmpty().withMessage('Level is required')
    .isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1 }).withMessage('Duration must be a positive number')
];

const validateUpdateCourse = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('duration')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be a positive number')
];

// ========================
// Quiz Validation Rules
// ========================

const validateCreateQuiz = [
  body('title')
    .trim()
    .notEmpty().withMessage('Quiz title is required'),
  body('courseId')
    .notEmpty().withMessage('Course ID is required'),
  body('questions')
    .isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.questionText')
    .trim()
    .notEmpty().withMessage('Question text is required'),
  body('questions.*.type')
    .isIn(['multiple-choice', 'true-false']).withMessage('Invalid question type'),
  body('questions.*.options')
    .isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('questions.*.correctAnswer')
    .notEmpty().withMessage('Correct answer is required'),
  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100')
];

// ========================
// Quiz Submission Validation
// ========================

const validateQuizSubmission = [
  param('quizId')
    .notEmpty().withMessage('Quiz ID is required'),
  body('answers')
    .isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .notEmpty().withMessage('Question ID is required'),
  body('answers.*.selectedAnswer')
    .notEmpty().withMessage('Selected answer is required')
];

// ========================
// Pagination Validation
// ========================

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateCourse,
  validateUpdateCourse,
  validateCreateQuiz,
  validateQuizSubmission,
  validatePagination
};
