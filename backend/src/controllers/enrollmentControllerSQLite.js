const EnrollmentSQLite = require('../models/EnrollmentSQLite');
const CourseSQLite = require('../models/CourseSQLite');
const CertificateSQLite = require('../models/CertificateSQLite');

const enrollmentController = {
  // Enroll in course
  enrollCourse: async (req, res) => {
    try {
      const { course_id } = req.body;
      const user_id = req.user.id;

      if (!course_id) {
        return res.status(400).json({ success: false, message: 'Course ID required' });
      }

      const course = await CourseSQLite.findById(course_id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Check if already enrolled
      const existing = await EnrollmentSQLite.findByUserAndCourse(user_id, course_id);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
      }

      const enrollment = await EnrollmentSQLite.create({
        user_id,
        course_id,
        status: 'active',
        progress: 0
      });

      res.status(201).json({
        success: true,
        message: 'Enrolled successfully',
        data: enrollment
      });
    } catch (err) {
      console.error('Error enrolling:', err);
      res.status(500).json({ success: false, message: 'Failed to enroll' });
    }
  },

  // Get user enrollments
  getUserEnrollments: async (req, res) => {
    try {
      const user_id = req.params.user_id || req.user.id;
      const { status } = req.query;

      const enrollments = await EnrollmentSQLite.findByUser(user_id, { status });

      // Get course details for each enrollment
      const enriched = await Promise.all(
        enrollments.map(async (enroll) => {
          const course = await CourseSQLite.findById(enroll.course_id);
          return { ...enroll, course };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Enrollments retrieved',
        data: enriched,
        count: enriched.length
      });
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
    }
  },

  // Get course enrollments
  getCourseEnrollments: async (req, res) => {
    try {
      const { course_id } = req.params;

      const enrollments = await EnrollmentSQLite.findByCourse(course_id);

      res.status(200).json({
        success: true,
        message: 'Course enrollments retrieved',
        data: enrollments,
        count: enrollments.length
      });
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
    }
  },

  // Get user progress in course
  getUserProgress: async (req, res) => {
    try {
      const { course_id } = req.params;
      const user_id = req.user.id;

      const enrollment = await EnrollmentSQLite.findByUserAndCourse(user_id, course_id);

      if (!enrollment) {
        return res.status(404).json({ success: false, message: 'Enrollment not found' });
      }

      const course = await CourseSQLite.findById(course_id);

      res.status(200).json({
        success: true,
        message: 'Progress retrieved',
        data: {
          enrollment,
          course
        }
      });
    } catch (err) {
      console.error('Error fetching progress:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch progress' });
    }
  },

  // Update progress
  updateProgress: async (req, res) => {
    try {
      const { enrollment_id } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress < 0 || progress > 100) {
        return res.status(400).json({ success: false, message: 'Invalid progress value' });
      }

      const updated = await EnrollmentSQLite.updateProgress(enrollment_id, progress);

      // Check if completed
      if (progress === 100) {
        const enrollment = await EnrollmentSQLite.findById(enrollment_id);
        await EnrollmentSQLite.markCompleted(enrollment_id);
        
        // Auto-generate certificate
        const course = await CourseSQLite.findById(enrollment.course_id);
        await CertificateSQLite.generateCertificate(
          enrollment.user_id,
          enrollment.course_id,
          course.title
        );
      }

      res.status(200).json({
        success: true,
        message: 'Progress updated',
        data: updated
      });
    } catch (err) {
      console.error('Error updating progress:', err);
      res.status(500).json({ success: false, message: 'Failed to update progress' });
    }
  },

  // Rate course
  rateCourse: async (req, res) => {
    try {
      const { enrollment_id } = req.params;
      const { rating, review } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
      }

      const updated = await EnrollmentSQLite.addRating(enrollment_id, rating, review || null);

      res.status(200).json({
        success: true,
        message: 'Rating added',
        data: updated
      });
    } catch (err) {
      console.error('Error rating course:', err);
      res.status(500).json({ success: false, message: 'Failed to rate course' });
    }
  },

  // Get enrollment stats
  getEnrollmentStats: async (req, res) => {
    try {
      const { course_id } = req.params;

      const stats = await EnrollmentSQLite.getEnrollmentStats(course_id);

      res.status(200).json({
        success: true,
        message: 'Stats retrieved',
        data: stats
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  },

  // Get user learning stats
  getUserLearningStats: async (req, res) => {
    try {
      const user_id = req.params.user_id || req.user.id;

      const stats = await EnrollmentSQLite.getLearningStats(user_id);

      res.status(200).json({
        success: true,
        message: 'Learning stats retrieved',
        data: stats
      });
    } catch (err) {
      console.error('Error fetching learning stats:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  },

  // Unenroll from course
  unenroll: async (req, res) => {
    try {
      const { enrollment_id } = req.params;

      const enrollment = await EnrollmentSQLite.findById(enrollment_id);
      if (!enrollment) {
        return res.status(404).json({ success: false, message: 'Enrollment not found' });
      }

      // Check authorization
      if (enrollment.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      await EnrollmentSQLite.delete(enrollment_id);

      res.status(200).json({
        success: true,
        message: 'Unenrolled successfully',
        data: { enrollment_id }
      });
    } catch (err) {
      console.error('Error unenrolling:', err);
      res.status(500).json({ success: false, message: 'Failed to unenroll' });
    }
  }
};

module.exports = enrollmentController;
