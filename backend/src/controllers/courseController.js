const CourseSQLite = require('../models/CourseSQLite');
const EnrollmentSQLite = require('../models/EnrollmentSQLite');
const UserSQLite = require('../models/UserSQLite');
const { dbPromise } = require('../config/sqlite');
const { validatePaginationParams } = require('../utils/validators');
const { generateLearningRecommendation } = require('../config/groqAPI');

/**
 * Get all courses
 * GET /api/courses?page=1&limit=10&category=programming&level=beginner&search=python
 */
exports.getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, search } = req.query;
    const { skip, limit: validLimit } = validatePaginationParams(page, limit);

    const filters = {
      isPublished: true,
      limit: validLimit,
      offset: skip
    };

    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (search) filters.search = search;

    const courses = await CourseSQLite.findAll(filters);
    const total = await CourseSQLite.count(filters);

    res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: validLimit,
          pages: Math.ceil(total / validLimit)
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve courses',
      statusCode: 500
    });
  }
};

/**
 * Get course details
 * GET /api/courses/:id
 */
exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await CourseSQLite.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    // Get instructor details
    const instructor = await UserSQLite.findById(course.instructor_id);
    const quizzes = await dbPromise.all('SELECT id, title, description FROM quizzes WHERE course_id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Course details retrieved successfully',
      data: {
        course: {
          ...course,
          instructor,
          quizzes
        }
      }
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve course details',
      statusCode: 500
    });
  }
};

/**
 * Create course
 * POST /api/courses
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, thumbnail_url, prerequisites } = req.body;
    const instructorId = req.user.id;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category',
        statusCode: 400
      });
    }

    // Create course
    const newCourse = await CourseSQLite.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      difficulty: difficulty || 'beginner',
      duration_hours: duration || 0,
      thumbnail_url: thumbnail_url || '',
      prerequisites: prerequisites || '',
      instructor_id: instructorId,
      isPublished: false
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course: newCourse }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create course',
      statusCode: 500
    });
  }
};

/**
 * Update course
 * PUT /api/courses/:id
 */
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, duration, thumbnail_url, isPublished } = req.body;
    const userId = req.user.id;

    const course = await CourseSQLite.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    if (course.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only course instructor can update this course',
        statusCode: 403
      });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (difficulty) updateData.difficulty = difficulty;
    if (duration) updateData.duration_hours = parseInt(duration);
    if (thumbnail_url) updateData.thumbnail_url = thumbnail_url;
    if (isPublished !== undefined) updateData.isPublished = isPublished ? 1 : 0;

    const updatedCourse = await CourseSQLite.update(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update course',
      statusCode: 500
    });
  }
};

/**
 * Delete course
 * DELETE /api/courses/:id
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await CourseSQLite.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    if (course.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only course instructor can delete this course',
        statusCode: 403
      });
    }

    // Delete course and its enrollments
    await dbPromise.run('DELETE FROM enrollments WHERE course_id = ?', [id]);
    await CourseSQLite.delete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete course',
      statusCode: 500
    });
  }
};

/**
 * Rate course
 * POST /api/courses/:id/rate
 */
exports.rateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
        statusCode: 400
      });
    }

    const course = await CourseSQLite.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    // Check if user is enrolled
    const enrollment = await dbPromise.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled to rate this course',
        statusCode: 403
      });
    }

    // Store rating (simple approach - can be enhanced with a ratings table)
    console.log(`Course ${id} rated ${rating} stars by ${userId}: ${comment || 'No comment'}`);

    res.status(200).json({
      success: true,
      message: 'Course rated successfully',
      data: { rating }
    });
  } catch (error) {
    console.error('Rate course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to rate course',
      statusCode: 500
    });
  }
};

/**
 * Get course recommendations for user
 * GET /api/courses/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's completed and enrolled courses
    const user = await UserSQLite.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    // Get enrolled courses
    const enrollments = await dbPromise.all(
      'SELECT DISTINCT category FROM courses c JOIN enrollments e ON c.id = e.course_id WHERE e.user_id = ?',
      [userId]
    );

    const userCategories = enrollments.map(e => e.category);

    // Find recommended courses
    const filters = { isPublished: true, limit: 6 };
    if (userCategories.length > 0) {
      filters.search = userCategories[0];
    }

    const recommendedCourses = await CourseSQLite.findAll(filters);

    // Generate AI recommendation text
    let aiRecommendation = '';
    try {
      aiRecommendation = await generateLearningRecommendation({
        completedCourses: userCategories,
        currentCourses: userCategories,
        strengths: userCategories,
        improvements: []
      });
    } catch (error) {
      console.warn('AI recommendation generation failed:', error);
      aiRecommendation = 'Continue your learning journey with courses in your interest areas!';
    }

    res.status(200).json({
      success: true,
      message: 'Course recommendations retrieved successfully',
      data: {
        courses: recommendedCourses,
        aiRecommendation
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recommendations',
      statusCode: 500
    });
  }
};

/**
 * Get trending courses
 * GET /api/courses/trending
 */
exports.getTrendingCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingCourses = await CourseSQLite.getPopular(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Trending courses retrieved successfully',
      data: { courses: trendingCourses }
    });
  } catch (error) {
    console.error('Get trending courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get trending courses',
      statusCode: 500
    });
  }
};
