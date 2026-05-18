const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { validatePaginationParams } = require('../utils/validators');

/**
 * Enroll in a course
 * POST /api/enrollments
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'Course ID is required',
        statusCode: 400
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        statusCode: 404
      });
    }

    if (!course.isPublished) {
      return res.status(403).json({
        success: false,
        error: 'This course is not published yet',
        statusCode: 403
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        error: 'You are already enrolled in this course',
        statusCode: 409
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
      status: 'active',
      progress: 0
    });

    await enrollment.save();

    // Update course student count
    course.studentCount = (course.studentCount || 0) + 1;
    course.enrolledStudents.push(userId);
    await course.save();

    // Update user's enrolled courses
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enroll in course',
      statusCode: 500
    });
  }
};

/**
 * Get user's enrollments
 * GET /api/enrollments?page=1&limit=10&status=active
 */
exports.getEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;
    const { skip, limit: validLimit } = validatePaginationParams(page, limit);

    // Build query
    const query = { userId };
    if (status) query.status = status;

    // Get total count
    const total = await Enrollment.countDocuments(query);

    // Get enrollments
    const enrollments = await Enrollment.find(query)
      .populate('courseId', 'title description category level thumbnail rating')
      .limit(validLimit)
      .skip(skip)
      .sort({ enrollmentDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments,
        pagination: {
          total,
          page: parseInt(page),
          limit: validLimit,
          pages: Math.ceil(total / validLimit)
        }
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve enrollments',
      statusCode: 500
    });
  }
};

/**
 * Get enrollment details
 * GET /api/enrollments/:courseId
 */
exports.getEnrollmentDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({ userId, courseId })
      .populate('courseId')
      .populate('userId', 'name email avatar');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enrollment details retrieved successfully',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Get enrollment details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve enrollment details',
      statusCode: 500
    });
  }
};

/**
 * Update enrollment progress
 * PUT /api/enrollments/:courseId/progress
 */
exports.updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, lastAccessedDate } = req.body;
    const userId = req.user.id;

    // Validate progress
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be between 0 and 100',
        statusCode: 400
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
        statusCode: 404
      });
    }

    // Update progress
    if (progress !== undefined) {
      enrollment.progress = progress;
      
      // Mark as completed if progress is 100
      if (progress === 100 && enrollment.status === 'active') {
        enrollment.status = 'completed';
        enrollment.certificateEarned = true;
        enrollment.certificateDate = new Date();

        // Add to user's completed courses
        const user = await User.findById(userId);
        if (!user.completedCourses.includes(courseId)) {
          user.completedCourses.push(courseId);
          user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== courseId);
          await user.save();
        }
      }
    }

    if (lastAccessedDate !== undefined) {
      enrollment.lastAccessedDate = new Date(lastAccessedDate);
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update progress',
      statusCode: 500
    });
  }
};

/**
 * Complete a course
 * PUT /api/enrollments/:courseId/complete
 */
exports.completeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Find enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
        statusCode: 404
      });
    }

    // Mark as completed
    enrollment.status = 'completed';
    enrollment.progress = 100;
    enrollment.certificateEarned = true;
    enrollment.certificateDate = new Date();

    await enrollment.save();

    // Update user's course lists
    const user = await User.findById(userId);
    if (!user.completedCourses.includes(courseId)) {
      user.completedCourses.push(courseId);
      user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== courseId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Course completed successfully',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Complete course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete course',
      statusCode: 500
    });
  }
};

/**
 * Unenroll from course
 * DELETE /api/enrollments/:courseId
 */
exports.unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Find enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
        statusCode: 404
      });
    }

    // Mark as dropped
    enrollment.status = 'dropped';
    await enrollment.save();

    // Update course student count
    const course = await Course.findById(courseId);
    if (course) {
      course.studentCount = Math.max(0, (course.studentCount || 1) - 1);
      course.enrolledStudents = course.enrolledStudents.filter(id => id.toString() !== userId);
      await course.save();
    }

    // Remove from user's enrolled courses
    const user = await User.findById(userId);
    user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== courseId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Unenrolled from course successfully'
    });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to unenroll from course',
      statusCode: 500
    });
  }
};

/**
 * Get enrollment statistics
 * GET /api/enrollments/stats/overview
 */
exports.getEnrollmentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Enrollment.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          completedCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          droppedCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    const enrollmentStats = stats.length > 0 ? stats[0] : {
      totalEnrollments: 0,
      completedCourses: 0,
      activeCourses: 0,
      droppedCourses: 0,
      averageProgress: 0
    };

    res.status(200).json({
      success: true,
      message: 'Enrollment statistics retrieved successfully',
      data: { stats: enrollmentStats }
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve enrollment statistics',
      statusCode: 500
    });
  }
};
