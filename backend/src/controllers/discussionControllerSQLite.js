const DiscussionSQLite = require('../models/DiscussionSQLite');
const db = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');

const discussionController = {
  // Create discussion thread
  createDiscussion: async (req, res) => {
    try {
      const { course_id, title, description } = req.body;
      const user_id = req.user.id;

      if (!course_id || !title) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO discussions (id, course_id, user_id, title, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, course_id, user_id, title, description || '', now, now]
      );

      const discussion = await db.get('SELECT * FROM discussions WHERE id = ?', [id]);

      res.status(201).json({
        success: true,
        message: 'Discussion created',
        data: discussion
      });
    } catch (err) {
      console.error('Error creating discussion:', err);
      res.status(500).json({ success: false, message: 'Failed to create discussion' });
    }
  },

  // Get discussions by course
  getDiscussionsByCourse: async (req, res) => {
    try {
      const { course_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const discussions = await db.all(
        `SELECT d.*, u.name as author_name, COUNT(r.id) as reply_count
         FROM discussions d
         LEFT JOIN users u ON d.user_id = u.id
         LEFT JOIN discussions r ON d.id = r.parent_id
         WHERE d.course_id = ? AND d.parent_id IS NULL
         GROUP BY d.id
         ORDER BY d.created_at DESC
         LIMIT ? OFFSET ?`,
        [course_id, parseInt(limit), offset]
      );

      const total = await db.get(
        'SELECT COUNT(*) as count FROM discussions WHERE course_id = ? AND parent_id IS NULL',
        [course_id]
      );

      res.status(200).json({
        success: true,
        message: 'Discussions retrieved',
        data: discussions,
        pagination: {
          total: total.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total.count / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Error fetching discussions:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
    }
  },

  // Get discussion thread (with replies)
  getDiscussionThread: async (req, res) => {
    try {
      const { discussion_id } = req.params;

      const discussion = await db.get(
        `SELECT d.*, u.name as author_name 
         FROM discussions d
         LEFT JOIN users u ON d.user_id = u.id
         WHERE d.id = ?`,
        [discussion_id]
      );

      if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
      }

      const replies = await db.all(
        `SELECT d.*, u.name as author_name 
         FROM discussions d
         LEFT JOIN users u ON d.user_id = u.id
         WHERE d.parent_id = ?
         ORDER BY d.created_at ASC`,
        [discussion_id]
      );

      res.status(200).json({
        success: true,
        message: 'Discussion thread retrieved',
        data: {
          ...discussion,
          replies,
          replyCount: replies.length
        }
      });
    } catch (err) {
      console.error('Error fetching discussion:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch discussion' });
    }
  },

  // Reply to discussion
  replyToDiscussion: async (req, res) => {
    try {
      const { discussion_id } = req.params;
      const { content } = req.body;
      const user_id = req.user.id;

      if (!content) {
        return res.status(400).json({ success: false, message: 'Content required' });
      }

      const parent = await db.get('SELECT * FROM discussions WHERE id = ?', [discussion_id]);
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO discussions (id, course_id, user_id, parent_id, title, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, parent.course_id, user_id, discussion_id, 'Reply', content, now, now]
      );

      const reply = await db.get('SELECT * FROM discussions WHERE id = ?', [id]);

      res.status(201).json({
        success: true,
        message: 'Reply posted',
        data: reply
      });
    } catch (err) {
      console.error('Error posting reply:', err);
      res.status(500).json({ success: false, message: 'Failed to post reply' });
    }
  },

  // Delete discussion or reply
  deleteDiscussion: async (req, res) => {
    try {
      const { discussion_id } = req.params;

      const discussion = await db.get('SELECT * FROM discussions WHERE id = ?', [discussion_id]);
      if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
      }

      // Check authorization
      if (discussion.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // Delete replies if parent discussion
      await db.run('DELETE FROM discussions WHERE parent_id = ?', [discussion_id]);
      // Delete discussion
      await db.run('DELETE FROM discussions WHERE id = ?', [discussion_id]);

      res.status(200).json({
        success: true,
        message: 'Discussion deleted',
        data: { id: discussion_id }
      });
    } catch (err) {
      console.error('Error deleting discussion:', err);
      res.status(500).json({ success: false, message: 'Failed to delete discussion' });
    }
  },

  // Search discussions
  searchDiscussions: async (req, res) => {
    try {
      const { course_id, q } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({ success: false, message: 'Search query too short' });
      }

      let query = `SELECT d.*, u.name as author_name FROM discussions d
                   LEFT JOIN users u ON d.user_id = u.id
                   WHERE d.parent_id IS NULL AND (d.title LIKE ? OR d.description LIKE ?)`;
      const params = [`%${q}%`, `%${q}%`];

      if (course_id) {
        query += ' AND d.course_id = ?';
        params.push(course_id);
      }

      query += ' ORDER BY d.created_at DESC LIMIT 20';

      const discussions = await db.all(query, params);

      res.status(200).json({
        success: true,
        message: 'Search results',
        data: discussions,
        count: discussions.length
      });
    } catch (err) {
      console.error('Error searching discussions:', err);
      res.status(500).json({ success: false, message: 'Failed to search discussions' });
    }
  },

  // Mark discussion resolved
  markResolved: async (req, res) => {
    try {
      const { discussion_id } = req.params;

      const discussion = await db.get('SELECT * FROM discussions WHERE id = ?', [discussion_id]);
      if (!discussion) {
        return res.status(404).json({ success: false, message: 'Discussion not found' });
      }

      await db.run('UPDATE discussions SET is_resolved = 1 WHERE id = ?', [discussion_id]);

      res.status(200).json({
        success: true,
        message: 'Discussion marked as resolved',
        data: { id: discussion_id }
      });
    } catch (err) {
      console.error('Error marking resolved:', err);
      res.status(500).json({ success: false, message: 'Failed to update discussion' });
    }
  },

  // Get user discussions
  getUserDiscussions: async (req, res) => {
    try {
      const user_id = req.params.user_id || req.user.id;

      const discussions = await db.all(
        `SELECT * FROM discussions 
         WHERE user_id = ? AND parent_id IS NULL
         ORDER BY created_at DESC`,
        [user_id]
      );

      res.status(200).json({
        success: true,
        message: 'User discussions retrieved',
        data: discussions,
        count: discussions.length
      });
    } catch (err) {
      console.error('Error fetching user discussions:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
    }
  }
};

module.exports = discussionController;
