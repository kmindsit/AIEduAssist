const { v4: uuidv4 } = require('uuid');
const { dbPromise } = require('../config/sqlite');

class Notification {
  static async create(notificationData) {
    const id = uuidv4();
    const {
      user_id,
      type,
      title,
      message,
      priority = 'normal',
      read = 0,
      actionUrl = null
    } = notificationData;

    await dbPromise.run(
      `INSERT INTO notifications (id, user_id, type, title, message, priority, read, actionUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [id, user_id, type, title, message, priority, read, actionUrl]
    );

    return this.findById(id);
  }

  static async findById(id) {
    const notification = await dbPromise.get(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    return notification ? this._formatNotification(notification) : null;
  }

  static async findByUser(userId, limit = 50, offset = 0) {
    const notifications = await dbPromise.all(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return notifications.map(n => this._formatNotification(n));
  }

  static async findUnread(userId) {
    const notifications = await dbPromise.all(
      'SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY createdAt DESC',
      [userId]
    );
    return notifications.map(n => this._formatNotification(n));
  }

  static async countUnread(userId) {
    const result = await dbPromise.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
      [userId]
    );
    return result.count || 0;
  }

  static async markAsRead(id) {
    await dbPromise.run(
      'UPDATE notifications SET read = 1, updatedAt = datetime("now") WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  static async markAllAsRead(userId) {
    await dbPromise.run(
      'UPDATE notifications SET read = 1, updatedAt = datetime("now") WHERE user_id = ? AND read = 0',
      [userId]
    );
  }

  static async delete(id) {
    await dbPromise.run('DELETE FROM notifications WHERE id = ?', [id]);
  }

  static async deleteAllByUser(userId) {
    await dbPromise.run('DELETE FROM notifications WHERE user_id = ?', [userId]);
  }

  static async findByPriority(userId, priority) {
    const notifications = await dbPromise.all(
      `SELECT * FROM notifications WHERE user_id = ? AND priority = ? ORDER BY createdAt DESC`,
      [userId, priority]
    );
    return notifications.map(n => this._formatNotification(n));
  }

  static _formatNotification(notification) {
    return {
      ...notification,
      read: notification.read === 1,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };
  }
}

module.exports = Notification;
