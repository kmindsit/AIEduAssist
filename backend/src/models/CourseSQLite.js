const { v4: uuidv4 } = require('uuid');
const { dbPromise } = require('../config/sqlite');

class CourseSQLite {
  static async create(courseData) {
    const {
      title,
      description,
      category,
      difficulty,
      price = 0,
      instructor_id,
      duration_hours = 0,
      thumbnail_url = '',
      prerequisites = '',
      isPublished = true
    } = courseData;

    const id = uuidv4();
    const now = new Date().toISOString();

    await dbPromise.run(
      `INSERT INTO courses (id, title, description, category, difficulty, price, instructor_id, duration_hours, thumbnail_url, prerequisites, isPublished, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, category, difficulty, price, instructor_id, duration_hours, thumbnail_url, prerequisites, isPublished ? 1 : 0, now, now]
    );

    return this.findById(id);
  }

  static async findById(id) {
    return dbPromise.get('SELECT * FROM courses WHERE id = ?', [id]);
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];

    if (filters.isPublished !== undefined) {
      query += ' AND isPublished = ?';
      params.push(filters.isPublished ? 1 : 0);
    }
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.difficulty) {
      query += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }
    if (filters.instructor_id) {
      query += ' AND instructor_id = ?';
      params.push(filters.instructor_id);
    }
    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const search = `%${filters.search}%`;
      params.push(search, search);
    }

    if (filters.sort) {
      query += ` ORDER BY ${filters.sort}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    return dbPromise.all(query, params);
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM courses WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.instructor_id) {
      query += ' AND instructor_id = ?';
      params.push(filters.instructor_id);
    }

    const result = await dbPromise.get(query, params);
    return result.count;
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

    await dbPromise.run(
      `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await dbPromise.run('DELETE FROM courses WHERE id = ?', [id]);
    return true;
  }

  static async getPopular(limit = 10) {
    return dbPromise.all(
      `SELECT c.*, COUNT(e.id) as enrollmentCount
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.isPublished = 1
       GROUP BY c.id
       ORDER BY enrollmentCount DESC
       LIMIT ?`,
      [limit]
    );
  }

  static async getByInstructor(instructor_id) {
    return dbPromise.all(
      'SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC',
      [instructor_id]
    );
  }

  static async search(query) {
    return dbPromise.all(
      `SELECT * FROM courses 
       WHERE isPublished = 1 AND (title LIKE ? OR description LIKE ? OR category LIKE ?)
       ORDER BY created_at DESC
       LIMIT 20`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
  }

  static async getCourseStats(courseId) {
    const enrollmentCount = await dbPromise.get(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
      [courseId]
    );

    const avgRating = await dbPromise.get(
      'SELECT AVG(rating) as avg FROM enrollments WHERE course_id = ? AND rating IS NOT NULL',
      [courseId]
    );

    const completionCount = await dbPromise.get(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ? AND status = ?',
      [courseId, 'completed']
    );

    return {
      enrollments: enrollmentCount.count,
      avgRating: avgRating.avg || 0,
      completions: completionCount.count
    };
  }
}

module.exports = CourseSQLite;
