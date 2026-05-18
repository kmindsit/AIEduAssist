const CourseSQLite = require('../models/CourseSQLite');

const courseController = {
  // Create course (Instructor/Admin only)
  createCourse: async (req, res) => {
    try {
      const { title, description, category, difficulty, price, duration_hours, thumbnail_url, prerequisites } = req.body;
      
      if (!title || !description || !category || !difficulty) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const course = await CourseSQLite.create({
        title,
        description,
        category,
        difficulty,
        price: price || 0,
        instructor_id: req.user.id,
        duration_hours: duration_hours || 0,
        thumbnail_url: thumbnail_url || '',
        prerequisites: prerequisites || '',
        isPublished: true
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (err) {
      console.error('Error creating course:', err);
      res.status(500).json({ success: false, message: 'Failed to create course' });
    }
  },

  // Get all courses
  getAllCourses: async (req, res) => {
    try {
      const { category, difficulty, search, page = 1, limit = 10 } = req.query;
      
      const filters = {
        isPublished: true,
        category: category || undefined,
        difficulty: difficulty || undefined,
        search: search || undefined,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const courses = await CourseSQLite.findAll(filters);
      const total = await CourseSQLite.count(filters);

      res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully',
        data: courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Error fetching courses:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
  },

  // Get course by ID
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const course = await CourseSQLite.findById(id);
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const stats = await CourseSQLite.getCourseStats(id);

      res.status(200).json({
        success: true,
        message: 'Course retrieved successfully',
        data: { ...course, ...stats }
      });
    } catch (err) {
      console.error('Error fetching course:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch course' });
    }
  },

  // Update course
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const course = await CourseSQLite.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Check authorization
      if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const updated = await CourseSQLite.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updated
      });
    } catch (err) {
      console.error('Error updating course:', err);
      res.status(500).json({ success: false, message: 'Failed to update course' });
    }
  },

  // Delete course
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await CourseSQLite.findById(id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Check authorization
      if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      await CourseSQLite.delete(id);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
        data: { id }
      });
    } catch (err) {
      console.error('Error deleting course:', err);
      res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
  },

  // Get courses by instructor
  getCoursesByInstructor: async (req, res) => {
    try {
      const { instructor_id } = req.params;

      const courses = await CourseSQLite.getByInstructor(instructor_id);

      res.status(200).json({
        success: true,
        message: 'Instructor courses retrieved',
        data: courses,
        count: courses.length
      });
    } catch (err) {
      console.error('Error fetching instructor courses:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
  },

  // Get popular courses
  getPopularCourses: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const courses = await CourseSQLite.getPopular(parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Popular courses retrieved',
        data: courses
      });
    } catch (err) {
      console.error('Error fetching popular courses:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
  },

  // Search courses
  searchCourses: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({ success: false, message: 'Search query too short' });
      }

      const courses = await CourseSQLite.search(q);

      res.status(200).json({
        success: true,
        message: 'Search results',
        data: courses,
        count: courses.length
      });
    } catch (err) {
      console.error('Error searching courses:', err);
      res.status(500).json({ success: false, message: 'Failed to search courses' });
    }
  }
};

module.exports = courseController;
