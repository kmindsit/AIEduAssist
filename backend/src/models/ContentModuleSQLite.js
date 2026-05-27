const { v4: uuidv4 } = require('uuid');
const { dbPromise } = require('../config/sqlite');

class ContentModule {
  static async create(moduleData) {
    const id = uuidv4();
    const {
      course_id,
      title,
      description,
      content,
      order,
      videoUrl = null,
      duration = 0,
      isPublished = true
    } = moduleData;

    await dbPromise.run(
      `INSERT INTO content_modules (id, course_id, title, description, content, "order", videoUrl, duration, isPublished, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [id, course_id, title, description, content, order, videoUrl, duration, isPublished ? 1 : 0]
    );

    return this.findById(id);
  }

  static async findById(id) {
    const module = await dbPromise.get(
      'SELECT * FROM content_modules WHERE id = ?',
      [id]
    );
    return module ? this._formatModule(module) : null;
  }

  static async findByCourse(courseId) {
    const modules = await dbPromise.all(
      'SELECT * FROM content_modules WHERE course_id = ? ORDER BY "order" ASC',
      [courseId]
    );
    return modules.map(m => this._formatModule(m));
  }

  static async update(id, updateData) {
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id') {
        updates.push(`"${key}" = ?`);
        values.push(updateData[key]);
      }
    });

    updates.push('updatedAt = datetime("now")');
    values.push(id);

    await dbPromise.run(
      `UPDATE content_modules SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await dbPromise.run('DELETE FROM content_modules WHERE id = ?', [id]);
  }

  static async reorder(courseId, moduleOrder) {
    for (let i = 0; i < moduleOrder.length; i++) {
      await dbPromise.run(
        `UPDATE content_modules SET "order" = ?, updatedAt = datetime("now") WHERE id = ?`,
        [i + 1, moduleOrder[i]]
      );
    }
  }

  static async publishModule(id) {
    await dbPromise.run(
      'UPDATE content_modules SET isPublished = 1, updatedAt = datetime("now") WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  static async unpublishModule(id) {
    await dbPromise.run(
      'UPDATE content_modules SET isPublished = 0, updatedAt = datetime("now") WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  static _formatModule(module) {
    return {
      ...module,
      isPublished: module.isPublished === 1,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt
    };
  }
}

module.exports = ContentModule;
