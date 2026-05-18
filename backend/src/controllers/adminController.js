const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');

/**
 * Get platform analytics
 * GET /api/admin/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const totalPublishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();

    // Get enrollment statistics
    const enrollmentStats = await Enrollment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const enrollmentByStatus = {
      active: 0,
      completed: 0,
      dropped: 0
    };

    enrollmentStats.forEach(stat => {
      enrollmentByStatus[stat._id] = stat.count;
    });

    // Get average rating
    const courseRatings = await Course.aggregate([
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    const averageRating = courseRatings.length > 0 ? courseRatings[0].averageRating : 0;

    // Get top courses
    const topCourses = await Course.find({ isPublished: true })
      .sort({ studentCount: -1 })
      .limit(5)
      .select('title studentCount rating');

    // Get new users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersLastWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        summary: {
          totalUsers,
          totalStudents,
          totalInstructors,
          totalCourses,
          totalPublishedCourses,
          totalEnrollments,
          totalQuizzes
        },
        enrollment: {
          byStatus: enrollmentByStatus,
          total: totalEnrollments
        },
        courses: {
          averageRating: parseFloat(averageRating.toFixed(2)),
          topCourses
        },
        growth: {
          newUsersLastWeek
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve analytics',
      statusCode: 500
    });
  }
};

/**
 * Get all users (with filters)
 * GET /api/admin/users?page=1&limit=20&role=student&isActive=true
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve users',
      statusCode: 500
    });
  }
};

/**
 * Get user details with full statistics
 * GET /api/admin/users/:id/details
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('enrolledCourses', 'title category')
      .populate('completedCourses', 'title category')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    // Get enrollment stats for this user
    const enrollmentStats = await Enrollment.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          droppedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    const stats = enrollmentStats.length > 0 ? enrollmentStats[0] : {
      totalEnrollments: 0,
      completedCount: 0,
      activeCount: 0,
      droppedCount: 0,
      averageProgress: 0
    };

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: {
        user,
        stats
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve user details',
      statusCode: 500
    });
  }
};

/**
 * Generate platform reports
 * GET /api/admin/reports?reportType=enrollment&startDate=2024-01-01&endDate=2024-12-31
 */
exports.generateReports = async (req, res) => {
  try {
    const { reportType = 'enrollment', startDate, endDate } = req.query;

    let report = {};
    const dateFilter = {};

    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDateObj;
      }
    }

    switch (reportType) {
      case 'enrollment':
        report = await generateEnrollmentReport(dateFilter);
        break;
      case 'course':
        report = await generateCourseReport(dateFilter);
        break;
      case 'user':
        report = await generateUserReport(dateFilter);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type. Choose from: enrollment, course, user',
          statusCode: 400
        });
    }

    res.status(200).json({
      success: true,
      message: `${reportType} report generated successfully`,
      data: { report }
    });
  } catch (error) {
    console.error('Generate reports error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate report',
      statusCode: 500
    });
  }
};

/**
 * Get courses statistics
 * GET /api/admin/courses/stats
 */
exports.getCoursesStats = async (req, res) => {
  try {
    const courseStats = await Course.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          averageStudents: { $avg: '$studentCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const publishedStats = await Course.countDocuments({ isPublished: true });
    const unpublishedStats = await Course.countDocuments({ isPublished: false });

    res.status(200).json({
      success: true,
      message: 'Course statistics retrieved successfully',
      data: {
        byLevel: courseStats,
        published: publishedStats,
        unpublished: unpublishedStats,
        total: publishedStats + unpublishedStats
      }
    });
  } catch (error) {
    console.error('Get courses stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve course statistics',
      statusCode: 500
    });
  }
};

/**
 * Get engagement metrics
 * GET /api/admin/engagement
 */
exports.getEngagementMetrics = async (req, res) => {
  try {
    // Active users (those who accessed courses in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await Enrollment.distinct('userId', {
      lastAccessedDate: { $gte: thirtyDaysAgo }
    });

    // Course completion rate
    const completionStats = await Enrollment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const completionRate = completionStats.length > 0
      ? ((completionStats[0].completed / completionStats[0].total) * 100).toFixed(2)
      : 0;

    // Average course rating
    const ratingStats = await Course.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = ratingStats.length > 0 ? ratingStats[0].avgRating.toFixed(2) : 0;

    res.status(200).json({
      success: true,
      message: 'Engagement metrics retrieved successfully',
      data: {
        activeUsersLast30Days: activeUsers.length,
        courseCompletionRate: `${completionRate}%`,
        averageCourseRating: avgRating,
        totalEnrollments: completionStats.length > 0 ? completionStats[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get engagement metrics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve engagement metrics',
      statusCode: 500
    });
  }
};

// Helper functions for reports
async function generateEnrollmentReport(dateFilter) {
  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.enrollmentDate = dateFilter;
  }

  const enrollments = await Enrollment.find(query)
    .populate('userId', 'name email role')
    .populate('courseId', 'title category level');

  return {
    type: 'enrollment',
    total: enrollments.length,
    data: enrollments
  };
}

async function generateCourseReport(dateFilter) {
  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }

  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .select('title category level studentCount rating isPublished');

  return {
    type: 'course',
    total: courses.length,
    data: courses
  };
}

async function generateUserReport(dateFilter) {
  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }

  const users = await User.find(query)
    .select('name email role isActive createdAt lastLogin');

  return {
    type: 'user',
    total: users.length,
    data: users
  };
}
