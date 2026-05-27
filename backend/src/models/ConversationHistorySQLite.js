const { dbPromise } = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');

class ConversationHistorySQLite {
  static async create(conversationId, userId, messageType, content, tokensUsed = 0) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await dbPromise.run(
      `INSERT INTO conversation_messages (id, conversation_id, user_id, message_type, content, tokens_used, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, conversationId, userId, messageType, content, tokensUsed, now]
    );

    return this.findById(id);
  }

  static async findById(id) {
    return dbPromise.get(`SELECT * FROM conversation_messages WHERE id = ?`, [id]);
  }

  static async findByConversation(conversationId, limit = 50, offset = 0) {
    return dbPromise.all(
      `SELECT * FROM conversation_messages WHERE conversation_id = ? ORDER BY createdAt ASC LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );
  }

  static async deleteByConversation(conversationId) {
    return dbPromise.run(`DELETE FROM conversation_messages WHERE conversation_id = ?`, [conversationId]);
  }
}

module.exports = ConversationHistorySQLite;
