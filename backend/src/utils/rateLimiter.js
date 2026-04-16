const rateLimit = require('express-rate-limit');
const { cacheManager } = require('./cacheManager');

// Generic rate limiter factory
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: false, // Return rate limit info in `RateLimit-*` headers
    skip: (req) => {
      // Skip for admin users
      return req.user && req.user.role === 'admin';
    },
  });
};

// API rate limiters
const rateLimiters = {
  // Strict rate limiting for auth endpoints (5 requests per 15 minutes)
  authLimiter: createRateLimiter(
    15 * 60 * 1000,
    5,
    'Too many authentication attempts, please try again later'
  ),

  // Medium rate limiting for API endpoints (100 requests per 15 minutes)
  apiLimiter: createRateLimiter(
    15 * 60 * 1000,
    100,
    'Too many API requests, please try again later'
  ),

  // Loose rate limiting for GET requests (500 requests per 15 minutes)
  readLimiter: createRateLimiter(
    15 * 60 * 1000,
    500,
    'Rate limit exceeded for read operations'
  ),

  // Per-user rate limiter for course creation
  courseCreationLimiter: async (req, res, next) => {
    const key = `course-creation:${req.user.id}`;
    const limit = 10; // 10 courses per day
    const windowSeconds = 24 * 60 * 60;

    const allowed = await cacheManager.checkRateLimit(key, limit, windowSeconds);

    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: 'Course creation limit exceeded. Try again tomorrow.',
      });
    }

    next();
  },

  // Per-user rate limiter for quiz submissions
  quizSubmissionLimiter: async (req, res, next) => {
    const key = `quiz-submission:${req.user.id}`;
    const limit = 50; // 50 submissions per hour
    const windowSeconds = 60 * 60;

    const allowed = await cacheManager.checkRateLimit(key, limit, windowSeconds);

    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: 'Quiz submission limit exceeded. Try again later.',
      });
    }

    next();
  },

  // Per-user rate limiter for discussion posts
  discussionLimiter: async (req, res, next) => {
    const key = `discussion:${req.user.id}`;
    const limit = 20; // 20 discussions per hour
    const windowSeconds = 60 * 60;

    const allowed = await cacheManager.checkRateLimit(key, limit, windowSeconds);

    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: 'Discussion posting limit exceeded. Try again later.',
      });
    }

    next();
  },

  // Per-user rate limiter for enrollment
  enrollmentLimiter: async (req, res, next) => {
    const key = `enrollment:${req.user.id}`;
    const limit = 30; // 30 enrollments per day
    const windowSeconds = 24 * 60 * 60;

    const allowed = await cacheManager.checkRateLimit(key, limit, windowSeconds);

    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: 'Enrollment limit exceeded for today. Try again tomorrow.',
      });
    }

    next();
  },
};

module.exports = rateLimiters;
