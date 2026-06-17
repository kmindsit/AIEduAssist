const db = require('../config/sqlite');

const analyticsController = {
  // Get user learning analytics
  getUserAnalytics: async (req, res) => {
    try {
      const user_id = req.params.user_id || req.user.id;

      // Total enrollments
      const enrollments = await db.get(
        'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?',
        [user_id]
      );

      // Completed courses
      const completed = await db.get(
        'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = ?',
        [user_id, 'completed']
      );

      // In progress courses
      const inProgress = await db.get(
        'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = ?',
        [user_id, 'active']
      );

      // Average progress
      const avgProgress = await db.get(
        'SELECT AVG(progress) as avg FROM enrollments WHERE user_id = ?',
        [user_id]
      );

      // Average rating given
      const avgRating = await db.get(
        'SELECT AVG(rating) as avg FROM enrollments WHERE user_id = ? AND rating IS NOT NULL',
        [user_id]
      );

      // Quiz statistics
      const quizAttempts = await db.get(
        'SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ?',
        [user_id]
      );

      const quizAvgScore = await db.get(
        'SELECT AVG(score) as avg FROM quiz_results WHERE user_id = ?',
        [user_id]
      );

      // Certificates earned
      const certificates = await db.get(
        'SELECT COUNT(*) as count FROM certificates WHERE user_id = ?',
        [user_id]
      );

      // Discussion participation
      const discussions = await db.get(
        'SELECT COUNT(*) as count FROM discussions WHERE user_id = ?',
        [user_id]
      );

      res.status(200).json({
        success: true,
        message: 'User analytics retrieved',
        data: {
          enrollments: enrollments.count,
          completed: completed.count,
          inProgress: inProgress.count,
          avgProgress: avgProgress.avg || 0,
          avgRating: avgRating.avg || 0,
          quizAttempts: quizAttempts.count,
          avgQuizScore: quizAvgScore.avg || 0,
          certificates: certificates.count,
          discussions: discussions.count
        }
      });
    } catch (err) {
      console.error('Error fetching user analytics:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
  },

  // Get course analytics
  getCourseAnalytics: async (req, res) => {
    try {
      const { course_id } = req.params;

      // Total enrollments
      const enrollments = await db.get(
        'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
        [course_id]
      );

      // Completion rate
      const completed = await db.get(
        'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ? AND status = ?',
        [course_id, 'completed']
      );

      const completionRate = enrollments.count > 0 
        ? ((completed.count / enrollments.count) * 100).toFixed(2)
        : 0;

      // Average rating
      const avgRating = await db.get(
        'SELECT AVG(rating) as avg FROM enrollments WHERE course_id = ? AND rating IS NOT NULL',
        [course_id]
      );

      // Average progress
      const avgProgress = await db.get(
        'SELECT AVG(progress) as avg FROM enrollments WHERE course_id = ?',
        [course_id]
      );

      // Quiz statistics
      const quizzes = await db.get(
        'SELECT COUNT(*) as count FROM quizzes WHERE course_id = ?',
        [course_id]
      );

      const totalAttempts = await db.get(
        'SELECT COUNT(*) as count FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id = ?)',
        [course_id]
      );

      const avgQuizScore = await db.get(
        'SELECT AVG(score) as avg FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id = ?)',
        [course_id]
      );

      // Certificates awarded
      const certificates = await db.get(
        'SELECT COUNT(*) as count FROM certificates WHERE course_id = ?',
        [course_id]
      );

      // Discussion count
      const discussions = await db.get(
        'SELECT COUNT(*) as count FROM discussions WHERE course_id = ? AND parent_id IS NULL',
        [course_id]
      );

      res.status(200).json({
        success: true,
        message: 'Course analytics retrieved',
        data: {
          enrollments: enrollments.count,
          completions: completed.count,
          completionRate: parseFloat(completionRate),
          avgProgress: avgProgress.avg || 0,
          avgRating: avgRating.avg || 0,
          quizzes: quizzes.count,
          totalQuizAttempts: totalAttempts.count,
          avgQuizScore: avgQuizScore.avg || 0,
          certificatesAwarded: certificates.count,
          discussions: discussions.count
        }
      });
    } catch (err) {
      console.error('Error fetching course analytics:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
  },

  // Get instructor analytics
  getInstructorAnalytics: async (req, res) => {
    try {
      const instructor_id = req.params.instructor_id || req.user.id;

      // Total courses
      const courses = await db.get(
        'SELECT COUNT(*) as count FROM courses WHERE instructor_id = ?',
        [instructor_id]
      );

      // Total students
      const students = await db.get(
        `SELECT COUNT(DISTINCT e.user_id) as count 
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE c.instructor_id = ?`,
        [instructor_id]
      );

      // Total completions
      const completions = await db.get(
        `SELECT COUNT(*) as count 
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE c.instructor_id = ? AND e.status = ?`,
        [instructor_id, 'completed']
      );

      // Average course rating
      const avgCourseRating = await db.get(
        `SELECT AVG(e.rating) as avg 
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE c.instructor_id = ? AND e.rating IS NOT NULL`,
        [instructor_id]
      );

      // Total quiz attempts
      const quizAttempts = await db.get(
        `SELECT COUNT(*) as count 
         FROM quiz_results qr
         JOIN quizzes q ON qr.quiz_id = q.id
         JOIN courses c ON q.course_id = c.id
         WHERE c.instructor_id = ?`,
        [instructor_id]
      );

      // Average quiz score
      const avgQuizScore = await db.get(
        `SELECT AVG(qr.score) as avg 
         FROM quiz_results qr
         JOIN quizzes q ON qr.quiz_id = q.id
         JOIN courses c ON q.course_id = c.id
         WHERE c.instructor_id = ?`,
        [instructor_id]
      );

      res.status(200).json({
        success: true,
        message: 'Instructor analytics retrieved',
        data: {
          courses: courses.count,
          students: students.count,
          completions: completions.count,
          avgCourseRating: avgCourseRating.avg || 0,
          quizAttempts: quizAttempts.count,
          avgQuizScore: avgQuizScore.avg || 0
        }
      });
    } catch (err) {
      console.error('Error fetching instructor analytics:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
  },

  // Get system-wide analytics (Admin only)
  getSystemAnalytics: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      // Total users
      const users = await db.get('SELECT COUNT(*) as count FROM users');

      // Users by role
      const studentCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['student']);
      const instructorCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['instructor']);
      const adminCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);

      // Total courses
      const courses = await db.get('SELECT COUNT(*) as count FROM courses WHERE isPublished = 1');

      // Total enrollments
      const enrollments = await db.get('SELECT COUNT(*) as count FROM enrollments');

      // Completion rate
      const completions = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE status = ?', ['completed']);
      const completionRate = enrollments.count > 0 
        ? ((completions.count / enrollments.count) * 100).toFixed(2)
        : 0;

      // Average course rating
      const avgRating = await db.get('SELECT AVG(rating) as avg FROM enrollments WHERE rating IS NOT NULL');

      // Quiz statistics
      const quizzes = await db.get('SELECT COUNT(*) as count FROM quizzes');
      const quizAttempts = await db.get('SELECT COUNT(*) as count FROM quiz_results');
      const avgQuizScore = await db.get('SELECT AVG(score) as avg FROM quiz_results');

      // Certificates
      const certificates = await db.get('SELECT COUNT(*) as count FROM certificates');

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const recentEnrollments = await db.get(
        'SELECT COUNT(*) as count FROM enrollments WHERE enrolled_at > ?',
        [sevenDaysAgo]
      );
      const recentQuizAttempts = await db.get(
        'SELECT COUNT(*) as count FROM quiz_results WHERE submitted_at > ?',
        [sevenDaysAgo]
      );

      res.status(200).json({
        success: true,
        message: 'System analytics retrieved',
        data: {
          users: users.count,
          usersByRole: {
            students: studentCount.count,
            instructors: instructorCount.count,
            admins: adminCount.count
          },
          courses: courses.count,
          enrollments: enrollments.count,
          completions: completions.count,
          completionRate: parseFloat(completionRate),
          avgCourseRating: avgRating.avg || 0,
          quizzes: quizzes.count,
          quizAttempts: quizAttempts.count,
          avgQuizScore: avgQuizScore.avg || 0,
          certificates: certificates.count,
          recentActivity: {
            enrollments: recentEnrollments.count,
            quizAttempts: recentQuizAttempts.count
          }
        }
      });
    } catch (err) {
      console.error('Error fetching system analytics:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
  },

  // Get engagement metrics
  getEngagementMetrics: async (req, res) => {
    try {
      const { course_id } = req.query;

      let query = `
        SELECT 
          COUNT(DISTINCT e.user_id) as active_users,
          AVG(e.progress) as avg_progress,
          COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN e.status = 'active' THEN 1 END) as in_progress,
          COUNT(CASE WHEN e.status = 'paused' THEN 1 END) as paused
        FROM enrollments e
      `;
      const params = [];

      if (course_id) {
        query += ' WHERE e.course_id = ?';
        params.push(course_id);
      }

      const metrics = await db.get(query, params);

      res.status(200).json({
        success: true,
        message: 'Engagement metrics retrieved',
        data: metrics
      });
    } catch (err) {
      console.error('Error fetching engagement metrics:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
    }
  }
};

module.exports = analyticsController;
