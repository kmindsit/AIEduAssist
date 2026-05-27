const { v4: uuidv4 } = require('uuid');
const { dbPromise } = require('../config/sqlite');

class NotificationPreference {
  static async create(userId) {
    const id = uuidv4();
    await dbPromise.run(
      `INSERT INTO notification_preferences (id, user_id, emailNotifications, inAppNotifications, quizReminders, courseUpdates, discussionNotifications, quietHoursEnabled, quietHoursStart, quietHoursEnd, notificationSummary, createdAt, updatedAt)
       VALUES (?, ?, 1, 1, 1, 1, 1, 0, '21:00', '09:00', 0, datetime('now'), datetime('now'))`,
      [id, userId]
    );
    return this.findByUser(userId);
  }

  static async findByUser(userId) {
    let prefs = await dbPromise.get(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );

    if (!prefs) {
      await this.create(userId);
      prefs = await dbPromise.get(
        'SELECT * FROM notification_preferences WHERE user_id = ?',
        [userId]
      );
    }

    return this._formatPreference(prefs);
  }

  static async update(userId, updateData) {
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'user_id') {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) return this.findByUser(userId);

    updates.push('updatedAt = datetime("now")');
    values.push(userId);

    await dbPromise.run(
      `UPDATE notification_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    return this.findByUser(userId);
  }

  static async toggleEmailNotifications(userId) {
    const prefs = await this.findByUser(userId);
    const newValue = prefs.emailNotifications ? 0 : 1;

    await dbPromise.run(
      'UPDATE notification_preferences SET emailNotifications = ?, updatedAt = datetime("now") WHERE user_id = ?',
      [newValue, userId]
    );

    return this.findByUser(userId);
  }

  static async setQuietHours(userId, startTime, endTime) {
    await dbPromise.run(
      `UPDATE notification_preferences SET quietHoursEnabled = 1, quietHoursStart = ?, quietHoursEnd = ?, updatedAt = datetime("now") WHERE user_id = ?`,
      [startTime, endTime, userId]
    );
    return this.findByUser(userId);
  }

  static async enableNotificationSummary(userId) {
    await dbPromise.run(
      'UPDATE notification_preferences SET notificationSummary = 1, updatedAt = datetime("now") WHERE user_id = ?',
      [userId]
    );
    return this.findByUser(userId);
  }

  static async disableNotificationSummary(userId) {
    await dbPromise.run(
      'UPDATE notification_preferences SET notificationSummary = 0, updatedAt = datetime("now") WHERE user_id = ?',
      [userId]
    );
    return this.findByUser(userId);
  }

  static async resetToDefaults(userId) {
    await dbPromise.run(
      `UPDATE notification_preferences SET emailNotifications = 1, inAppNotifications = 1, quizReminders = 1, courseUpdates = 1, discussionNotifications = 1, quietHoursEnabled = 0, notificationSummary = 0, updatedAt = datetime("now") WHERE user_id = ?`,
      [userId]
    );
    return this.findByUser(userId);
  }

  static _formatPreference(pref) {
    return {
      ...pref,
      emailNotifications: pref.emailNotifications === 1,
      inAppNotifications: pref.inAppNotifications === 1,
      quizReminders: pref.quizReminders === 1,
      courseUpdates: pref.courseUpdates === 1,
      discussionNotifications: pref.discussionNotifications === 1,
      quietHoursEnabled: pref.quietHoursEnabled === 1,
      notificationSummary: pref.notificationSummary === 1
    };
  }
}

module.exports = NotificationPreference;
