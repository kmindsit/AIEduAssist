const { generateContent } = require('../config/groqAPI');
const { dbPromise } = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class AITutoringService {
  static hashQuery(query) {
    return crypto.createHash('sha256').update(query).digest('hex');
  }

  static async getCachedResponse(query, cacheType = 'general') {
    const queryHash = this.hashQuery(query);
    const cached = await dbPromise.get(
      `SELECT response FROM ai_cache WHERE query_hash = ? AND cache_type = ? AND (ttl IS NULL OR ttl > datetime('now'))`,
      [queryHash, cacheType]
    );
    return cached ? JSON.parse(cached.response) : null;
  }

  static async cacheResponse(query, response, cacheType = 'general', courseId = null) {
    const id = uuidv4();
    const queryHash = this.hashQuery(query);
    const ttl = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    try {
      await dbPromise.run(
        `INSERT OR REPLACE INTO ai_cache (id, query_hash, response, cache_type, course_id, ttl, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [id, queryHash, JSON.stringify(response), cacheType, courseId, ttl]
      );
    } catch (err) {
      console.warn('Cache write error:', err.message);
    }
  }

  static async sendMessage(conversationId, message, courseData) {
    try {
      const cached = await this.getCachedResponse(message, 'tutor');
      if (cached) return cached;
      const context = `You are a helpful AI tutor for the course: "${courseData.title}"`;
      const aiResponse = await generateContent(`${context}\n\nStudent question: ${message}`);
      await this.cacheResponse(message, aiResponse, 'tutor', courseData.id);
      return aiResponse;
    } catch (error) {
      throw new Error('Failed to generate AI response');
    }
  }

  static async generateStudyGuide(courseId, courseData) {
    const cached = await this.getCachedResponse(`guide_${courseId}`, 'study_guide');
    if (cached) return cached;
    const prompt = `Create a comprehensive study guide for "${courseData.title}". Include: Key Concepts, Important Terms, Study Tips, Common Mistakes, Review Questions`;
    const response = await generateContent(prompt);
    await this.cacheResponse(`guide_${courseId}`, response, 'study_guide', courseId);
    return response;
  }
}

module.exports = AITutoringService;
