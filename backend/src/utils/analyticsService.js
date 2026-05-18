const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// User learning path and analytics
const analyticsService = {
  // Get user learning path
  getUserLearningPath: async (userId) => {
    try {
      const enrollments = await Enrollment.find({ userId })
        .populate('courseId', 'title category level')
        .sort({ enrolledAt: -1 });

      const courseIds = enrollments.map((e) => e.courseId._id);

      // Get recommendations based on enrolled courses
      const enrolledCourses = await Course.find({ _id: { $in: courseIds } });
      const categories = [
        ...new Set(enrolledCourses.map((c) => c.category)),
      ];

      const similarCourses = await Course.find({
        category: { $in: categories },
        _id: { $nin: courseIds },
      })
        .limit(5)
        .sort({ avgRating: -1 });

      return {
        enrolledCourses: enrollments,
        recommendedCourses: similarCourses,
        learningCategories: categories,
      };
    } catch (error) {
      console.error('Error getting learning path:', error);
      return null;
    }
  },

  // Get user progress analytics
  getUserProgressAnalytics: async (userId) => {
    try {
      const enrollments = await Enrollment.find({ userId });

      const totalEnrolled = enrollments.length;
      const completed = enrollments.filter((e) => e.status === 'completed').length;
      const inProgress = enrollments.filter((e) => e.status === 'active').length;
      const dropped = enrollments.filter((e) => e.status === 'dropped').length;

      const totalHours = await Course.aggregate([
        {
          $match: {
            _id: {
              $in: enrollments.map((e) => e.courseId),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalHours: { $sum: '$duration' },
          },
        },
      ]);

      const avgProgress =
        enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) /
            enrollments.length
          : 0;

      return {
        totalEnrolled,
        completed,
        inProgress,
        dropped,
        completionRate: ((completed / totalEnrolled) * 100).toFixed(2) + '%',
        avgProgress: avgProgress.toFixed(2) + '%',
        totalHours: totalHours[0]?.totalHours || 0,
      };
    } catch (error) {
      console.error('Error getting progress analytics:', error);
      return null;
    }
  },

  // Get course analytics (instructor view)
  getCourseAnalytics: async (courseId) => {
    try {
      const enrollments = await Enrollment.find({ courseId });
      const course = await Course.findById(courseId);

      if (!course) return null;

      const totalEnrolled = enrollments.length;
      const completed = enrollments.filter((e) => e.status === 'completed').length;
      const inProgress = enrollments.filter((e) => e.status === 'active').length;
      const dropped = enrollments.filter((e) => e.status === 'dropped').length;

      const avgProgress =
        enrollments.length > 0
          ? (enrollments.reduce((sum, e) => sum + e.progress, 0) /
              enrollments.length).toFixed(2)
          : 0;

      // Get engagement by week
      const engagementByWeek = await Enrollment.aggregate([
        { $match: { courseId: course._id } },
        {
          $group: {
            _id: {
              $week: '$enrolledAt',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return {
        courseTitle: course.title,
        totalEnrolled,
        completed,
        inProgress,
        dropped,
        completionRate: ((completed / totalEnrolled) * 100).toFixed(2) + '%',
        avgProgress: avgProgress + '%',
        avgRating: course.avgRating,
        totalReviews: course.reviews?.length || 0,
        engagementByWeek,
      };
    } catch (error) {
      console.error('Error getting course analytics:', error);
      return null;
    }
  },

  // Get platform-wide analytics
  getPlatformAnalytics: async () => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });
      const totalCourses = await Course.countDocuments();
      const totalEnrollments = await Enrollment.countDocuments();

      const completedEnrollments = await Enrollment.countDocuments({
        status: 'completed',
      });

      const avgCompletionRate =
        ((completedEnrollments / totalEnrollments) * 100).toFixed(2) + '%';

      const coursesByCategory = await Course.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);

      const topCourses = await Course.find()
        .sort({ studentCount: -1 })
        .limit(5)
        .select('title studentCount avgRating');

      return {
        totalUsers,
        activeUsers,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        avgCompletionRate,
        coursesByCategory,
        topCourses,
      };
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      return null;
    }
  },

  // Get skill-based recommendations
  getSkillBasedRecommendations: async (userId, limit = 5) => {
    try {
      const enrollments = await Enrollment.find({ userId }).populate('courseId');

      const skills = new Set();
      enrollments.forEach((e) => {
        if (e.courseId.skills) {
          e.courseId.skills.forEach((s) => skills.add(s));
        }
      });

      const recommendedCourses = await Course.find({
        skills: { $in: Array.from(skills) },
        _id: {
          $nin: enrollments.map((e) => e.courseId._id),
        },
      })
        .limit(limit)
        .sort({ avgRating: -1 });

      return recommendedCourses;
    } catch (error) {
      console.error('Error getting skill-based recommendations:', error);
      return [];
    }
  },

  // Get trending topics
  getTrendingTopics: async (limit = 10) => {
    try {
      const trending = await Enrollment.aggregate([
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $unwind: '$course',
        },
        {
          $group: {
            _id: '$course.category',
            enrollments: { $sum: 1 },
          },
        },
        {
          $sort: { enrollments: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      return trending;
    } catch (error) {
      console.error('Error getting trending topics:', error);
      return [];
    }
  },
};

module.exports = analyticsService;
