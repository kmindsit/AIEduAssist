const db = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../services/emailService');

const notificationController = {
  // Create notification
  createNotification: async (req, res) => {
    try {
      const { user_id, type, title, message, related_id } = req.body;

      if (!user_id || !type || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO notifications (id, user_id, type, title, message, related_id, read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user_id, type, title || '', message, related_id || null, 0, now]
      );

      const notification = await db.get('SELECT * FROM notifications WHERE id = ?', [id]);

      // Send email if user has preference
      const prefs = await db.get(
        'SELECT * FROM notification_preferences WHERE user_id = ?',
        [user_id]
      );

      if (prefs && prefs.email_enabled) {
        const user = await db.get('SELECT email, name FROM users WHERE id = ?', [user_id]);
        if (user) {
          await emailService.sendNotificationEmail(user.email, user.name, title || type, message);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Notification created',
        data: notification
      });
    } catch (err) {
      console.error('Error creating notification:', err);
      res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
  },

  // Get user notifications
  getUserNotifications: async (req, res) => {
    try {
      const user_id = req.params.user_id || req.user.id;
      const { read, page = 1, limit = 20 } = req.query;

      let query = 'SELECT * FROM notifications WHERE user_id = ?';
      const params = [user_id];

      if (read !== undefined) {
        query += ' AND read = ?';
        params.push(read === 'true' ? 1 : 0);
      }

      query += ' ORDER BY created_at DESC';
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const notifications = await db.all(query, params);

      const countResult = await db.get(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
        [user_id]
      );

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved',
        data: notifications,
        pagination: {
          total: countResult.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.count / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { notification_id } = req.params;

      const notification = await db.get('SELECT * FROM notifications WHERE id = ?', [notification_id]);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      await db.run('UPDATE notifications SET read = 1 WHERE id = ?', [notification_id]);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { id: notification_id }
      });
    } catch (err) {
      console.error('Error marking as read:', err);
      res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
  },

  // Mark all as read
  markAllAsRead: async (req, res) => {
    try {
      const user_id = req.user.id;

      await db.run('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0', [user_id]);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (err) {
      console.error('Error marking all as read:', err);
      res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { notification_id } = req.params;

      const notification = await db.get('SELECT * FROM notifications WHERE id = ?', [notification_id]);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      if (notification.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      await db.run('DELETE FROM notifications WHERE id = ?', [notification_id]);

      res.status(200).json({
        success: true,
        message: 'Notification deleted',
        data: { id: notification_id }
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
  },

  // Get notification preferences
  getPreferences: async (req, res) => {
    try {
      const user_id = req.user.id;

      let prefs = await db.get('SELECT * FROM notification_preferences WHERE user_id = ?', [user_id]);

      if (!prefs) {
        // Create default preferences
        const id = uuidv4();
        await db.run(
          `INSERT INTO notification_preferences (id, user_id, email_enabled, in_app_enabled, push_enabled)
           VALUES (?, ?, ?, ?, ?)`,
          [id, user_id, 1, 1, 1]
        );
        prefs = await db.get('SELECT * FROM notification_preferences WHERE user_id = ?', [user_id]);
      }

      res.status(200).json({
        success: true,
        message: 'Preferences retrieved',
        data: prefs
      });
    } catch (err) {
      console.error('Error fetching preferences:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch preferences' });
    }
  },

  // Update notification preferences
  updatePreferences: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { email_enabled, in_app_enabled, push_enabled } = req.body;

      let prefs = await db.get('SELECT * FROM notification_preferences WHERE user_id = ?', [user_id]);

      if (!prefs) {
        const id = uuidv4();
        await db.run(
          `INSERT INTO notification_preferences (id, user_id, email_enabled, in_app_enabled, push_enabled)
           VALUES (?, ?, ?, ?, ?)`,
          [id, user_id, email_enabled !== false ? 1 : 0, in_app_enabled !== false ? 1 : 0, push_enabled !== false ? 1 : 0]
        );
      } else {
        await db.run(
          `UPDATE notification_preferences 
           SET email_enabled = ?, in_app_enabled = ?, push_enabled = ? 
           WHERE user_id = ?`,
          [email_enabled !== false ? 1 : 0, in_app_enabled !== false ? 1 : 0, push_enabled !== false ? 1 : 0, user_id]
        );
      }

      const updated = await db.get('SELECT * FROM notification_preferences WHERE user_id = ?', [user_id]);

      res.status(200).json({
        success: true,
        message: 'Preferences updated',
        data: updated
      });
    } catch (err) {
      console.error('Error updating preferences:', err);
      res.status(500).json({ success: false, message: 'Failed to update preferences' });
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    try {
      const user_id = req.user.id;

      const result = await db.get(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
        [user_id]
      );

      res.status(200).json({
        success: true,
        message: 'Unread count retrieved',
        data: { unreadCount: result.count }
      });
    } catch (err) {
      console.error('Error fetching unread count:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch count' });
    }
  },

  // Bulk delete notifications
  bulkDelete: async (req, res) => {
    try {
      const { notification_ids } = req.body;

      if (!notification_ids || !Array.isArray(notification_ids)) {
        return res.status(400).json({ success: false, message: 'Invalid notification IDs' });
      }

      const placeholders = notification_ids.map(() => '?').join(',');
      await db.run(
        `DELETE FROM notifications WHERE id IN (${placeholders}) AND user_id = ?`,
        [...notification_ids, req.user.id]
      );

      res.status(200).json({
        success: true,
        message: 'Notifications deleted',
        data: { deletedCount: notification_ids.length }
      });
    } catch (err) {
      console.error('Error bulk deleting:', err);
      res.status(500).json({ success: false, message: 'Failed to delete notifications' });
    }
  }
};

module.exports = notificationController;
