const { dbPromise } = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');

class ConversationSQLite {
  static async create(userId, courseId, title = null) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await dbPromise.run(
      `INSERT INTO conversations (id, user_id, course_id, title, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, courseId, title, now, now]
    );

    return this.findById(id);
  }

  static async findById(id) {
    return dbPromise.get(
      `SELECT * FROM conversations WHERE id = ?`,
      [id]
    );
  }

  static async findByUserAndCourse(userId, courseId) {
    return dbPromise.all(
      `SELECT * FROM conversations WHERE user_id = ? AND course_id = ? ORDER BY updatedAt DESC`,
      [userId, courseId]
    );
  }

  static async findByUser(userId) {
    return dbPromise.all(
      `SELECT * FROM conversations WHERE user_id = ? ORDER BY updatedAt DESC`,
      [userId]
    );
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM conversations WHERE 1=1';
    const params = [];

    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.courseId) {
      query += ' AND course_id = ?';
      params.push(filters.courseId);
    }

    query += ' ORDER BY updatedAt DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return dbPromise.all(query, params);
  }

  static async update(id, updateData) {
    const now = new Date().toISOString();
    const fields = [];
    const params = [];

    if (updateData.title !== undefined) {
      fields.push('title = ?');
      params.push(updateData.title);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updatedAt = ?');
    params.push(now);
    params.push(id);

    await dbPromise.run(
      `UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id) {
    return dbPromise.run(`DELETE FROM conversations WHERE id = ?`, [id]);
  }

  static async getMessageCount(conversationId) {
    const result = await dbPromise.get(
      `SELECT COUNT(*) as count FROM conversation_messages WHERE conversation_id = ?`,
      [conversationId]
    );
    return result ? result.count : 0;
  }
}

module.exports = ConversationSQLite;
