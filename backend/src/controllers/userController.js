const User = require('../models/User');
const { validatePaginationParams } = require('../utils/validators');
const mongoose = require('mongoose');

/**
 * Get user profile
 * GET /api/users/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('enrolledCourses', 'title category level')
      .populate('completedCourses', 'title category')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve profile',
      statusCode: 500
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, phone, location, avatar } = req.body;

    // Validate input
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters',
        statusCode: 400
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Bio must not exceed 500 characters',
        statusCode: 400
      });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (avatar) updateData.avatar = avatar;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
      statusCode: 500
    });
  }
};

/**
 * Get user details (Admin only)
 * GET /api/users/:id
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('enrolledCourses', 'title category level')
      .populate('completedCourses', 'title category')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: { user }
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
 * Get all users (Admin only)
 * GET /api/users?page=1&limit=10&role=student
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const { skip, limit: validLimit } = validatePaginationParams(page, limit);

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Get total count
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-password')
      .limit(validLimit)
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
          limit: validLimit,
          pages: Math.ceil(total / validLimit)
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
 * Deactivate user account (Admin only)
 * PUT /api/users/:id/deactivate
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to deactivate user',
      statusCode: 500
    });
  }
};

/**
 * Get user statistics
 * GET /api/users/:id/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    const stats = {
      totalEnrolledCourses: user.enrolledCourses?.length || 0,
      totalCompletedCourses: user.completedCourses?.length || 0,
      totalCertificates: user.certificates?.length || 0,
      memberSince: user.createdAt,
      lastActive: user.lastLogin,
      accountStatus: user.isActive ? 'active' : 'inactive'
    };

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve user statistics',
      statusCode: 500
    });
  }
};

/**
 * Delete user account (Admin only)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete user',
      statusCode: 500
    });
  }
};

/**
 * Get user analytics overview
 * GET /api/users/analytics
 */
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('enrolledCourses')
      .populate('completedCourses');

    const Enrollment = require('../models/Enrollment');
    const Quiz = require('../models/Quiz');
    const Certificate = require('../models/Certificate');

    // Get enrollment stats
    const enrollmentStats = await Enrollment.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalEnrolled: { $sum: 1 },
          totalCompleted: {
            $sum: { $cond: ['$completedAt', 1, 0] }
          },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Get quiz stats
    const quizStats = await Quiz.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          avgScore: { $avg: '$passingScore' }
        }
      }
    ]);

    // Get certificates
    const certificates = await Certificate.countDocuments({ userId });

    // Calculate study hours (placeholder - would need actual tracking)
    const studyHours = enrollmentStats[0]?.avgProgress * 10 || 0;

    res.status(200).json({
      success: true,
      message: 'User analytics retrieved successfully',
      data: {
        analytics: {
          enrolledCourses: enrollmentStats[0]?.totalEnrolled || 0,
          completedCourses: enrollmentStats[0]?.totalCompleted || 0,
          averageProgress: Math.round(enrollmentStats[0]?.avgProgress || 0),
          totalCertificates: certificates,
          studyHoursLogged: Math.round(studyHours),
          quizzesTaken: quizStats[0]?.totalQuizzes || 0,
          currentStreak: 0
        }
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve analytics',
      statusCode: 500
    });
  }
};

/**
 * Get user learning path
 * GET /api/users/analytics/learning-path
 */
exports.getLearningPath = async (req, res) => {
  try {
    const userId = req.user.id;
    const Enrollment = require('../models/Enrollment');

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title category level')
      .sort('-createdAt')
      .limit(5);

    const path = enrollments.map((e, index) => ({
      milestone: index + 1,
      title: e.courseId?.title || 'Unknown',
      category: e.courseId?.category || 'General',
      progress: e.progress || 0,
      startDate: e.createdAt,
      completed: e.completedAt ? true : false,
      level: e.courseId?.level || 'Beginner'
    }));

    res.status(200).json({
      success: true,
      message: 'Learning path retrieved successfully',
      data: { learningPath: path }
    });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve learning path',
      statusCode: 500
    });
  }
};

/**
 * Get user course progress
 * GET /api/users/analytics/course-progress
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const Enrollment = require('../models/Enrollment');

    const courseProgress = await Enrollment.find({ userId })
      .populate('courseId', 'title category duration level')
      .lean();

    const progress = courseProgress.map(ep => ({
      courseId: ep.courseId?._id,
      title: ep.courseId?.title || 'Unknown',
      category: ep.courseId?.category || 'General',
      progress: ep.progress || 0,
      status: ep.completedAt ? 'Completed' : ep.progress > 0 ? 'In Progress' : 'Not Started',
      estimatedHours: ep.courseId?.duration || 0,
      startDate: ep.createdAt,
      completionDate: ep.completedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Course progress retrieved successfully',
      data: { courseProgress: progress }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve course progress',
      statusCode: 500
    });
  }
};

/**
 * Get quiz performance
 * GET /api/users/analytics/quiz-performance
 */
exports.getQuizPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');

    // Placeholder aggregation - would need actual quiz submission tracking
    const QuizSubmission = require('../models/QuizSubmission') || null;

    if (!QuizSubmission) {
      return res.status(200).json({
        success: true,
        message: 'Quiz performance retrieved successfully',
        data: {
          quizPerformance: {
            totalAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            weakAreas: [],
            recentQuizzes: []
          }
        }
      });
    }

    const quizzes = await QuizSubmission.find({ userId })
      .sort('-submittedAt')
      .limit(10)
      .lean();

    const avgScore = quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
      : 0;

    res.status(200).json({
      success: true,
      message: 'Quiz performance retrieved successfully',
      data: {
        quizPerformance: {
          totalAttempts: quizzes.length,
          averageScore: avgScore,
          bestScore: Math.max(...quizzes.map(q => q.score || 0), 0),
          weakAreas: [],
          recentQuizzes: quizzes.slice(0, 5)
        }
      }
    });
  } catch (error) {
    console.error('Get quiz performance error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve quiz performance',
      statusCode: 500
    });
  }
};

/**
 * Get enrollment trends
 * GET /api/users/analytics/enrollment-trends
 */
exports.getEnrollmentTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const Enrollment = require('../models/Enrollment');

    // Get enrollment data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Enrollment.find({
      userId,
      createdAt: { $gte: sixMonthsAgo }
    })
      .group({
        _id: { $month: '$createdAt' },
        count: { $sum: 1 }
      })
      .sort('_id');

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendData = monthNames.map((month, index) => ({
      month,
      enrollments: trends.find(t => t._id === index + 1)?.count || 0
    }));

    res.status(200).json({
      success: true,
      message: 'Enrollment trends retrieved successfully',
      data: { trends: trendData }
    });
  } catch (error) {
    console.error('Get enrollment trends error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve enrollment trends',
      statusCode: 500
    });
  }
};

/**
 * Get time spent analytics
 * GET /api/users/analytics/time-spent
 */
exports.getTimeSpentAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const Enrollment = require('../models/Enrollment');

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title')
      .lean();

    // Calculate time based on progress (placeholder)
    const timeData = enrollments.map(e => ({
      course: e.courseId?.title || 'Unknown',
      hoursSpent: Math.round(e.progress / 10),
      lastActive: e.updatedAt
    }));

    const totalHours = timeData.reduce((sum, t) => sum + t.hoursSpent, 0);

    res.status(200).json({
      success: true,
      message: 'Time spent analytics retrieved successfully',
      data: {
        timeSpent: {
          totalHours,
          averageDaily: Math.round(totalHours / 30),
          byCourseByCourse: timeData
        }
      }
    });
  } catch (error) {
    console.error('Get time spent analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve time spent analytics',
      statusCode: 500
    });
  }
};

/**
 * Get skills gained
 * GET /api/users/analytics/skills
 */
exports.getSkillsGained = async (req, res) => {
  try {
    const userId = req.user.id;
    const Certificate = require('../models/Certificate');

    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title skills')
      .lean();

    // Extract skills from certificates
    const skillsMap = new Map();
    certificates.forEach(cert => {
      if (cert.courseId?.skills) {
        cert.courseId.skills.forEach(skill => {
          skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
        });
      }
    });

    const skills = Array.from(skillsMap, ([name, proficiency]) => ({
      name,
      proficiency: Math.min(proficiency * 25, 100),
      certificateCount: skillsMap.get(name)
    }));

    res.status(200).json({
      success: true,
      message: 'Skills gained retrieved successfully',
      data: { skills }
    });
  } catch (error) {
    console.error('Get skills gained error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve skills',
      statusCode: 500
    });
  }
};

/**
 * Get certificate progress
 * GET /api/users/analytics/certificates
 */
exports.getCertificateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const Certificate = require('../models/Certificate');
    const Enrollment = require('../models/Enrollment');

    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title')
      .lean();

    const enrollments = await Enrollment.find({ userId }).lean();

    const certProgress = {
      earned: certificates.length,
      inProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
      notStarted: enrollments.filter(e => e.progress === 0).length,
      recentCertificates: certificates.slice(0, 5)
    };

    res.status(200).json({
      success: true,
      message: 'Certificate progress retrieved successfully',
      data: { certificateProgress: certProgress }
    });
  } catch (error) {
    console.error('Get certificate progress error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve certificate progress',
      statusCode: 500
    });
  }
};

/**
 * Get study streaks
 * GET /api/users/analytics/streaks
 */
exports.getStudyStreaks = async (req, res) => {
  try {
    const userId = req.user.id;
    const Enrollment = require('../models/Enrollment');

    // Placeholder - would need actual daily tracking
    const enrollments = await Enrollment.findOne({ userId })
      .sort('-updatedAt')
      .lean();

    const streakData = {
      currentStreak: 0,
      longestStreak: 0,
      daysActive: enrollments ? 1 : 0,
      lastActive: enrollments?.updatedAt || null
    };

    res.status(200).json({
      success: true,
      message: 'Study streaks retrieved successfully',
      data: { streaks: streakData }
    });
  } catch (error) {
    console.error('Get study streaks error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve streaks',
      statusCode: 500
    });
  }
};

/**
 * Get course analytics (Instructor view)
 * GET /api/courses/:courseId/analytics
 */
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;
    const Enrollment = require('../models/Enrollment');
    const Course = require('../models/Course');

    // Verify instructor owns course
    const course = await Course.findById(courseId).lean();
    if (!course || course.instructor?.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this course analytics',
        statusCode: 403
      });
    }

    // Get enrollment stats
    const enrollments = await Enrollment.find({ courseId }).lean();

    const analytics = {
      totalEnrollments: enrollments.length,
      completed: enrollments.filter(e => e.completedAt).length,
      inProgress: enrollments.filter(e => !e.completedAt && e.progress > 0).length,
      notStarted: enrollments.filter(e => e.progress === 0).length,
      averageProgress: Math.round(
        enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
          : 0
      ),
      completionRate: Math.round(
        enrollments.length > 0
          ? (enrollments.filter(e => e.completedAt).length / enrollments.length) * 100
          : 0
      )
    };

    res.status(200).json({
      success: true,
      message: 'Course analytics retrieved successfully',
      data: { courseAnalytics: analytics }
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve course analytics',
      statusCode: 500
    });
  }
};

/**
 * Get recommendations
 * GET /api/users/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');

    // Get completed courses
    const completed = await Enrollment.find({ userId, completedAt: { $exists: true } })
      .populate('courseId', 'category level');

    // Get categories from completed courses
    const categories = completed.map(e => e.courseId?.category).filter(Boolean);

    // Find similar courses not enrolled
    const recommendations = await Course.find({
      category: { $in: categories },
      _id: { $nin: completed.map(e => e.courseId?._id) }
    })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Recommendations retrieved successfully',
      data: { recommendations }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve recommendations',
      statusCode: 500
    });
  }
};

/**
 * Get next recommended courses
 * GET /api/users/recommendations/next-courses
 */
exports.getNextCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');

    const enrolled = await Enrollment.find({ userId }).select('courseId').lean();
    const enrolledIds = enrolled.map(e => e.courseId);

    const nextCourses = await Course.find({
      _id: { $nin: enrolledIds }
    })
      .sort('-rating')
      .limit(3)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Next courses retrieved successfully',
      data: { nextCourses }
    });
  } catch (error) {
    console.error('Get next courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve next courses',
      statusCode: 500
    });
  }
};

/**
 * Get weak areas to study
 * GET /api/users/recommendations/weak-areas
 */
exports.getWeakAreasToStudy = async (req, res) => {
  try {
    const userId = req.user.id;
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');

    // Get courses with low progress (weak areas)
    const weakAreas = await Enrollment.find({
      userId,
      progress: { $gt: 0, $lt: 50 }
    })
      .populate('courseId', 'title category')
      .sort('progress')
      .limit(3)
      .lean();

    const areas = weakAreas.map(e => ({
      courseId: e.courseId?._id,
      title: e.courseId?.title,
      category: e.courseId?.category,
      currentProgress: e.progress,
      suggestedNext: 'Review course materials'
    }));

    res.status(200).json({
      success: true,
      message: 'Weak areas retrieved successfully',
      data: { weakAreas: areas }
    });
  } catch (error) {
    console.error('Get weak areas error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve weak areas',
      statusCode: 500
    });
  }
};
