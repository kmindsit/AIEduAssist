const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { validatePaginationParams } = require('../utils/validators');
const { generateLearningRecommendation } = require('../config/groqAPI');

/**
 * Get all courses
 * GET /api/courses?page=1&limit=10&category=programming&level=beginner&search=python
 */
exports.getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;
    const { skip, limit: validLimit } = validatePaginationParams(page, limit);

    // Build query
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Course.countDocuments(query);

    // Get courses
    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .limit(validLimit)
      .skip(skip)
      .sort({ createdAt: -1 });

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

    const course = await Course.findById(id)
      .populate('instructor', 'name email avatar bio')
      .populate('quizzes', 'title description');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course details retrieved successfully',
      data: { course }
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
    const { title, description, category, level, duration, thumbnail } = req.body;
    const instructorId = req.user.id;

    // Validate required fields
    if (!title || !description || !category || !level || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category, level, duration',
        statusCode: 400
      });
    }

    // Validate level
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Level must be beginner, intermediate, or advanced',
        statusCode: 400
      });
    }

    // Create course
    const newCourse = new Course({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level,
      duration: parseInt(duration),
      thumbnail,
      instructor: instructorId,
      isPublished: false
    });

    await newCourse.save();

    // Populate instructor info
    await newCourse.populate('instructor', 'name email avatar');

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
    const { title, description, category, level, duration, thumbnail, isPublished } = req.body;
    const userId = req.user.id;

    // Check course exists and user is instructor
    const course = await Course.findById(id);
    
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
        error: 'Only course instructor can update this course',
        statusCode: 403
      });
    }

    // Validate level if provided
    if (level && !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Level must be beginner, intermediate, or advanced',
        statusCode: 400
      });
    }

    // Build update object
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (level) updateData.level = level;
    if (duration) updateData.duration = parseInt(duration);
    if (thumbnail) updateData.thumbnail = thumbnail;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email avatar');

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

    const course = await Course.findById(id);
    
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
        error: 'Only course instructor can delete this course',
        statusCode: 403
      });
    }

    // Delete course and its enrollments
    await Enrollment.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);

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

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
        statusCode: 400
      });
    }

    // Check course exists
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({ userId, courseId: id });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled to rate this course',
        statusCode: 403
      });
    }

    // Remove existing review if any
    course.reviews = course.reviews.filter(r => r.userId.toString() !== userId);

    // Add new review
    course.reviews.push({
      userId,
      rating,
      comment: comment || ''
    });

    // Calculate average rating
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.rating = (totalRating / course.reviews.length).toFixed(1);

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course rated successfully',
      data: { course }
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
    const user = await User.findById(userId)
      .populate('completedCourses', 'category title')
      .populate('enrolledCourses', 'category title');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    // Extract user's interests from completed courses
    const completedCategories = user.completedCourses?.map(c => c.category) || [];
    const enrolledCategories = user.enrolledCourses?.map(c => c.category) || [];
    const userCategories = [...new Set([...completedCategories, ...enrolledCategories])];

    // Find recommended courses
    let query = { isPublished: true };
    if (userCategories.length > 0) {
      query.category = { $in: userCategories };
    }

    const recommendedCourses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .limit(6)
      .sort({ rating: -1, studentCount: -1 });

    // Generate AI recommendation text
    let aiRecommendation = '';
    try {
      aiRecommendation = await generateLearningRecommendation({
        completedCourses: completedCategories,
        currentCourses: enrolledCategories,
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

    const trendingCourses = await Course.find({ isPublished: true })
      .populate('instructor', 'name avatar')
      .limit(parseInt(limit))
      .sort({ studentCount: -1, rating: -1 });

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
