const { v4: uuidv4 } = require('uuid');
const db = require('../config/sqlite');

class CertificateSQLite {
  static async create(certificateData) {
    const {
      user_id,
      course_id,
      title,
      issue_date = new Date().toISOString(),
      expiry_date = null,
      verification_url = ''
    } = certificateData;

    const id = uuidv4();

    await db.run(
      `INSERT INTO certificates (id, user_id, course_id, title, issue_date, expiry_date, verification_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, course_id, title, issue_date, expiry_date, verification_url, new Date().toISOString()]
    );

    return this.findById(id);
  }

  static async findById(id) {
    return db.get('SELECT * FROM certificates WHERE id = ?', [id]);
  }

  static async findByUser(user_id) {
    return db.all(
      'SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC',
      [user_id]
    );
  }

  static async findByCourse(course_id) {
    return db.all(
      'SELECT * FROM certificates WHERE course_id = ? ORDER BY issue_date DESC',
      [course_id]
    );
  }

  static async findByUserAndCourse(user_id, course_id) {
    return db.get(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM certificates WHERE 1=1';
    const params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.course_id) {
      query += ' AND course_id = ?';
      params.push(filters.course_id);
    }

    query += ' ORDER BY issue_date DESC';

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
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    values.push(id);

    await db.run(
      `UPDATE certificates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.run('DELETE FROM certificates WHERE id = ?', [id]);
    return true;
  }

  static async verify(certificateId) {
    const cert = await this.findById(certificateId);
    
    if (!cert) {
      return { valid: false, message: 'Certificate not found' };
    }

    if (cert.expiry_date && new Date(cert.expiry_date) < new Date()) {
      return { valid: false, message: 'Certificate has expired' };
    }

    return {
      valid: true,
      certificate: cert,
      message: 'Certificate is valid'
    };
  }

  static async getCertificateStats(course_id) {
    const total = await db.get(
      'SELECT COUNT(*) as count FROM certificates WHERE course_id = ?',
      [course_id]
    );

    return {
      total: total.count
    };
  }

  static async getUserCertificateCount(user_id) {
    const result = await db.get(
      'SELECT COUNT(*) as count FROM certificates WHERE user_id = ?',
      [user_id]
    );

    return result.count;
  }

  static async generateCertificate(user_id, course_id, courseName) {
    const existingCert = await this.findByUserAndCourse(user_id, course_id);
    
    if (existingCert) {
      return existingCert;
    }

    const verification_url = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/certificates/verify/${uuidv4()}`;
    const issue_date = new Date().toISOString();
    // Certificate valid for 1 year
    const expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    return this.create({
      user_id,
      course_id,
      title: `Certificate of Completion - ${courseName}`,
      issue_date,
      expiry_date,
      verification_url
    });
  }

  static async getRecentCertificates(limit = 10) {
    return db.all(
      'SELECT * FROM certificates ORDER BY issue_date DESC LIMIT ?',
      [limit]
    );
  }

  static async getCertificatesByDateRange(startDate, endDate) {
    return db.all(
      `SELECT * FROM certificates 
       WHERE issue_date >= ? AND issue_date <= ?
       ORDER BY issue_date DESC`,
      [startDate, endDate]
    );
  }
}

module.exports = CertificateSQLite;
