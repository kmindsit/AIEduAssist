const { v4: uuidv4 } = require('uuid');
const db = require('../config/sqlite');

class EnrollmentSQLite {
  static async create(enrollmentData) {
    const {
      user_id,
      course_id,
      status = 'active',
      progress = 0,
      rating = null,
      review = null
    } = enrollmentData;

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO enrollments (id, user_id, course_id, status, progress, rating, review, enrolled_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, course_id, status, progress, rating, review, now, now]
    );

    return this.findById(id);
  }

  static async findById(id) {
    return db.get('SELECT * FROM enrollments WHERE id = ?', [id]);
  }

  static async findByUserAndCourse(user_id, course_id) {
    return db.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
  }

  static async findByUser(user_id, filters = {}) {
    let query = 'SELECT * FROM enrollments WHERE user_id = ?';
    const params = [user_id];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY enrolled_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return db.all(query, params);
  }

  static async findByCourse(course_id) {
    return db.all(
      'SELECT * FROM enrollments WHERE course_id = ? ORDER BY enrolled_at DESC',
      [course_id]
    );
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM enrollments WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY enrolled_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    return db.all(query, params);
  }

  static async update(id, updateData) {
    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.run(
      `UPDATE enrollments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async updateProgress(enrollment_id, progress) {
    return this.update(enrollment_id, { progress });
  }

  static async addRating(enrollment_id, rating, review) {
    return this.update(enrollment_id, { rating, review });
  }

  static async markCompleted(enrollment_id) {
    return this.update(enrollment_id, { status: 'completed', progress: 100 });
  }

  static async delete(id) {
    await db.run('DELETE FROM enrollments WHERE id = ?', [id]);
    return true;
  }

  static async getEnrollmentStats(course_id) {
    const total = await db.get(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
      [course_id]
    );

    const completed = await db.get(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ? AND status = ?',
      [course_id, 'completed']
    );

    const avgProgress = await db.get(
      'SELECT AVG(progress) as avg FROM enrollments WHERE course_id = ?',
      [course_id]
    );

    return {
      total: total.count,
      completed: completed.count,
      avgProgress: avgProgress.avg || 0,
      completionRate: total.count > 0 ? (completed.count / total.count * 100).toFixed(2) : 0
    };
  }

  static async getUserProgress(user_id, course_id) {
    return db.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
  }

  static async getLearningStats(user_id) {
    const total = await db.get(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?',
      [user_id]
    );

    const completed = await db.get(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = ?',
      [user_id, 'completed']
    );

    const inProgress = await db.get(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = ?',
      [user_id, 'active']
    );

    const avgRating = await db.get(
      'SELECT AVG(rating) as avg FROM enrollments WHERE user_id = ? AND rating IS NOT NULL',
      [user_id]
    );

    return {
      totalEnrolled: total.count,
      completed: completed.count,
      inProgress: inProgress.count,
      avgRating: avgRating.avg || 0
    };
  }
}

module.exports = EnrollmentSQLite;
