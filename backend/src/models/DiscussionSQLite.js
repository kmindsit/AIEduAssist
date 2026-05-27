const { v4: uuidv4 } = require('uuid');
const { dbPromise } = require('../config/sqlite');

class Discussion {
  static async create(discussionData) {
    const id = uuidv4();
    const {
      course_id,
      user_id,
      title,
      content,
      tags = ''
    } = discussionData;

    await dbPromise.run(
      `INSERT INTO discussions (id, course_id, user_id, title, content, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [id, course_id, user_id, title, content, tags]
    );

    return this.findById(id);
  }

  static async findById(id) {
    const discussion = await dbPromise.get(
      'SELECT * FROM discussions WHERE id = ?',
      [id]
    );
    return discussion ? this._formatDiscussion(discussion) : null;
  }

  static async findByCourse(courseId, limit = 20, offset = 0) {
    const discussions = await dbPromise.all(
      `SELECT * FROM discussions WHERE course_id = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [courseId, limit, offset]
    );
    return discussions.map(d => this._formatDiscussion(d));
  }

  static async update(id, updateData) {
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id') {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    updates.push('updatedAt = datetime("now")');
    values.push(id);

    await dbPromise.run(
      `UPDATE discussions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await dbPromise.run('DELETE FROM discussions WHERE id = ?', [id]);
  }

  static async addReply(discussionId, userId, content) {
    const id = uuidv4();
    await dbPromise.run(
      `INSERT INTO discussion_replies (id, discussion_id, user_id, content, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [id, discussionId, userId, content]
    );
    return { id, discussion_id: discussionId, user_id: userId, content };
  }

  static async getReplies(discussionId) {
    return dbPromise.all(
      'SELECT * FROM discussion_replies WHERE discussion_id = ? ORDER BY createdAt ASC',
      [discussionId]
    );
  }

  static _formatDiscussion(discussion) {
    return {
      ...discussion,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt
    };
  }
}

module.exports = Discussion;
