const db = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');

const adminController = {
  // Get all users (Admin only)
  getAllUsers: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { role, page = 1, limit = 20 } = req.query;

      let query = 'SELECT id, name, email, role, isActive, created_at FROM users WHERE 1=1';
      const params = [];

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      query += ' ORDER BY created_at DESC';
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const users = await db.all(query, params);

      const countResult = await db.get(
        'SELECT COUNT(*) as count FROM users' + (role ? ' WHERE role = ?' : ''),
        role ? [role] : []
      );

      res.status(200).json({
        success: true,
        message: 'Users retrieved',
        data: users,
        pagination: {
          total: countResult.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.count / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  },

  // Get user details
  getUserDetails: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { user_id } = req.params;

      const user = await db.get('SELECT * FROM users WHERE id = ?', [user_id]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Remove password
      delete user.password;

      // Get user statistics
      const enrollments = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?', [user_id]);
      const completed = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = ?', [user_id, 'completed']);
      const certificates = await db.get('SELECT COUNT(*) as count FROM certificates WHERE user_id = ?', [user_id]);

      res.status(200).json({
        success: true,
        message: 'User details retrieved',
        data: {
          ...user,
          stats: {
            enrollments: enrollments.count,
            completed: completed.count,
            certificates: certificates.count
          }
        }
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
  },

  // Update user role
  updateUserRole: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { user_id } = req.params;
      const { role } = req.body;

      if (!['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      const user = await db.get('SELECT * FROM users WHERE id = ?', [user_id]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await db.run('UPDATE users SET role = ? WHERE id = ?', [role, user_id]);

      res.status(200).json({
        success: true,
        message: 'User role updated',
        data: { user_id, role }
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  },

  // Deactivate user
  deactivateUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { user_id } = req.params;

      const user = await db.get('SELECT * FROM users WHERE id = ?', [user_id]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await db.run('UPDATE users SET isActive = 0 WHERE id = ?', [user_id]);

      res.status(200).json({
        success: true,
        message: 'User deactivated',
        data: { user_id }
      });
    } catch (err) {
      console.error('Error deactivating user:', err);
      res.status(500).json({ success: false, message: 'Failed to deactivate user' });
    }
  },

  // Activate user
  activateUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { user_id } = req.params;

      const user = await db.get('SELECT * FROM users WHERE id = ?', [user_id]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await db.run('UPDATE users SET isActive = 1 WHERE id = ?', [user_id]);

      res.status(200).json({
        success: true,
        message: 'User activated',
        data: { user_id }
      });
    } catch (err) {
      console.error('Error activating user:', err);
      res.status(500).json({ success: false, message: 'Failed to activate user' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { user_id } = req.params;

      if (user_id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
      }

      // Delete user data
      await db.run('DELETE FROM enrollments WHERE user_id = ?', [user_id]);
      await db.run('DELETE FROM quiz_results WHERE user_id = ?', [user_id]);
      await db.run('DELETE FROM certificates WHERE user_id = ?', [user_id]);
      await db.run('DELETE FROM discussions WHERE user_id = ?', [user_id]);
      await db.run('DELETE FROM notifications WHERE user_id = ?', [user_id]);
      await db.run('DELETE FROM users WHERE id = ?', [user_id]);

      res.status(200).json({
        success: true,
        message: 'User deleted',
        data: { user_id }
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  },

  // Get all courses (with moderation)
  getAllCourses: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { page = 1, limit = 20 } = req.query;

      const courses = await db.all(
        `SELECT c.*, u.name as instructor_name 
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
      );

      const countResult = await db.get('SELECT COUNT(*) as count FROM courses');

      res.status(200).json({
        success: true,
        message: 'Courses retrieved',
        data: courses,
        pagination: {
          total: countResult.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.count / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Error fetching courses:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
  },

  // Unpublish course
  unpublishCourse: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { course_id } = req.params;

      await db.run('UPDATE courses SET isPublished = 0 WHERE id = ?', [course_id]);

      res.status(200).json({
        success: true,
        message: 'Course unpublished',
        data: { course_id }
      });
    } catch (err) {
      console.error('Error unpublishing course:', err);
      res.status(500).json({ success: false, message: 'Failed to unpublish course' });
    }
  },

  // Delete course
  deleteCourse: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { course_id } = req.params;

      // Delete course data
      await db.run('DELETE FROM enrollments WHERE course_id = ?', [course_id]);
      await db.run('DELETE FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id = ?)', [course_id]);
      await db.run('DELETE FROM quizzes WHERE course_id = ?', [course_id]);
      await db.run('DELETE FROM certificates WHERE course_id = ?', [course_id]);
      await db.run('DELETE FROM discussions WHERE course_id = ?', [course_id]);
      await db.run('DELETE FROM courses WHERE id = ?', [course_id]);

      res.status(200).json({
        success: true,
        message: 'Course deleted',
        data: { course_id }
      });
    } catch (err) {
      console.error('Error deleting course:', err);
      res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
  },

  // Get system settings
  getSystemSettings: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      // Get settings from environment or defaults
      const settings = {
        siteName: process.env.SITE_NAME || 'AIEduAssist',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
        maxUploadSize: process.env.MAX_UPLOAD_SIZE || '10mb',
        enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
        enablePayments: process.env.ENABLE_PAYMENTS === 'true',
        defaultCoursePrice: process.env.DEFAULT_COURSE_PRICE || 0
      };

      res.status(200).json({
        success: true,
        message: 'Settings retrieved',
        data: settings
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
  },

  // Generate admin report
  generateReport: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { reportType = 'summary' } = req.query;

      let report = {
        generatedAt: new Date().toISOString(),
        reportType
      };

      if (reportType === 'summary' || reportType === 'all') {
        const users = await db.get('SELECT COUNT(*) as count FROM users');
        const courses = await db.get('SELECT COUNT(*) as count FROM courses WHERE isPublished = 1');
        const enrollments = await db.get('SELECT COUNT(*) as count FROM enrollments');
        const completions = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE status = ?', ['completed']);

        report.summary = {
          totalUsers: users.count,
          totalCourses: courses.count,
          totalEnrollments: enrollments.count,
          completions: completions.count,
          completionRate: enrollments.count > 0 ? ((completions.count / enrollments.count) * 100).toFixed(2) : 0
        };
      }

      if (reportType === 'users' || reportType === 'all') {
        const byRole = await db.all(
          'SELECT role, COUNT(*) as count FROM users GROUP BY role'
        );
        report.users = byRole.reduce((acc, row) => {
          acc[row.role] = row.count;
          return acc;
        }, {});
      }

      if (reportType === 'courses' || reportType === 'all') {
        const byCategory = await db.all(
          'SELECT category, COUNT(*) as count FROM courses WHERE isPublished = 1 GROUP BY category'
        );
        report.courses = byCategory.reduce((acc, row) => {
          acc[row.category] = row.count;
          return acc;
        }, {});
      }

      res.status(200).json({
        success: true,
        message: 'Report generated',
        data: report
      });
    } catch (err) {
      console.error('Error generating report:', err);
      res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }
};

module.exports = adminController;
