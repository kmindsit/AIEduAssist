const { dbPromise } = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    await dbPromise.run(
      `INSERT INTO users (id, name, email, password, role, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [id, userData.name, userData.email.toLowerCase(), hashedPassword, userData.role || 'student']
    );
    
    return this.findById(id);
  }

  static async findById(id) {
    const user = await dbPromise.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return user ? this._formatUser(user) : null;
  }

  static async findByEmail(email) {
    const user = await dbPromise.get(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    return user ? this._formatUser(user) : null;
  }

  static async findOne(query) {
    if (query.email) {
      return this.findByEmail(query.email);
    }
    if (query.id) {
      return this.findById(query.id);
    }
    return null;
  }

  static async findAll() {
    const users = await dbPromise.all('SELECT * FROM users');
    return users.map(u => this._formatUser(u));
  }

  static async update(id, updateData) {
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== 'password') {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updatedAt = datetime("now")');
    values.push(id);

    await dbPromise.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await dbPromise.run('DELETE FROM users WHERE id = ?', [id]);
  }

  static async verifyPassword(id, password) {
    const user = await dbPromise.get(
      'SELECT password FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) return false;
    return bcrypt.compare(password, user.password);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dbPromise.run(
      'UPDATE users SET password = ?, updatedAt = datetime("now") WHERE id = ?',
      [hashedPassword, id]
    );
  }

  static _formatUser(user) {
    return {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive === 1,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      toObject: function() {
        const { _id, ...rest } = this;
        return rest;
      }
    };
  }
}

module.exports = User;
