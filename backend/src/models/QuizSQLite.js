const { v4: uuidv4 } = require('uuid');
const db = require('../config/sqlite');

class QuizSQLite {
  static async create(quizData) {
    const {
      course_id,
      title,
      description = '',
      questions = 0,
      passing_score = 70,
      duration_minutes = 30,
      retake_allowed = true
    } = quizData;

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO quizzes (id, course_id, title, description, questions, passing_score, duration_minutes, retake_allowed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, course_id, title, description, questions, passing_score, duration_minutes, retake_allowed ? 1 : 0, now, now]
    );

    return this.findById(id);
  }

  static async findById(id) {
    return db.get('SELECT * FROM quizzes WHERE id = ?', [id]);
  }

  static async findByCourse(course_id) {
    return db.all(
      'SELECT * FROM quizzes WHERE course_id = ? ORDER BY created_at DESC',
      [course_id]
    );
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM quizzes WHERE 1=1';
    const params = [];

    if (filters.course_id) {
      query += ' AND course_id = ?';
      params.push(filters.course_id);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
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
      `UPDATE quizzes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.run('DELETE FROM quiz_results WHERE quiz_id = ?', [id]);
    await db.run('DELETE FROM quizzes WHERE id = ?', [id]);
    return true;
  }

  static async submitQuiz(submissionData) {
    const {
      user_id,
      quiz_id,
      answers,
      score,
      time_spent = 0
    } = submissionData;

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO quiz_results (id, user_id, quiz_id, answers, score, time_spent, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, quiz_id, JSON.stringify(answers), score, time_spent, now]
    );

    return this.getResult(id);
  }

  static async getResult(resultId) {
    return db.get('SELECT * FROM quiz_results WHERE id = ?', [resultId]);
  }

  static async getUserResults(user_id, quiz_id) {
    return db.all(
      'SELECT * FROM quiz_results WHERE user_id = ? AND quiz_id = ? ORDER BY submitted_at DESC',
      [user_id, quiz_id]
    );
  }

  static async getQuizStats(quiz_id) {
    const totalSubmissions = await db.get(
      'SELECT COUNT(*) as count FROM quiz_results WHERE quiz_id = ?',
      [quiz_id]
    );

    const avgScore = await db.get(
      'SELECT AVG(score) as avg FROM quiz_results WHERE quiz_id = ?',
      [quiz_id]
    );

    const passCount = await db.get(
      'SELECT COUNT(*) as count FROM quiz_results WHERE quiz_id = ? AND score >= (SELECT passing_score FROM quizzes WHERE id = ?)',
      [quiz_id, quiz_id]
    );

    const quiz = await this.findById(quiz_id);

    return {
      totalSubmissions: totalSubmissions.count,
      avgScore: avgScore.avg || 0,
      passCount: passCount.count,
      passRate: totalSubmissions.count > 0 ? (passCount.count / totalSubmissions.count * 100).toFixed(2) : 0,
      passingScore: quiz.passing_score
    };
  }

  static async getUserQuizAttempts(user_id, quiz_id) {
    return db.all(
      `SELECT * FROM quiz_results 
       WHERE user_id = ? AND quiz_id = ? 
       ORDER BY submitted_at DESC`,
      [user_id, quiz_id]
    );
  }

  static async getLatestAttempt(user_id, quiz_id) {
    return db.get(
      `SELECT * FROM quiz_results 
       WHERE user_id = ? AND quiz_id = ? 
       ORDER BY submitted_at DESC 
       LIMIT 1`,
      [user_id, quiz_id]
    );
  }

  static async calculateScore(answers, correctAnswers) {
    let score = 0;
    const totalQuestions = correctAnswers.length;

    answers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        score++;
      }
    });

    return Math.round((score / totalQuestions) * 100);
  }
}

module.exports = QuizSQLite;
