const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'aieduassist.db');

// Create or open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log(`
Database Connection Successful
File: ${dbPath}
Type: SQLite3
Status: Connected
  `);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
const createTables = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        level TEXT,
        duration INTEGER,
        instructor_id TEXT NOT NULL,
        status TEXT DEFAULT 'published',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id)
      )
    `);

    // Enrollments table
    db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        progress REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id),
        UNIQUE(user_id, course_id)
      )
    `);

    // Quizzes table
    db.run(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        totalQuestions INTEGER,
        passingScore REAL DEFAULT 70,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Quiz results table
    db.run(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        score REAL,
        status TEXT,
        completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);

    // Certificates table
    db.run(`
      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        issueDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiryDate DATETIME,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT,
        title TEXT,
        message TEXT,
        priority TEXT DEFAULT 'normal',
        read INTEGER DEFAULT 0,
        actionUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Notification Preferences table
    db.run(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        emailNotifications INTEGER DEFAULT 1,
        inAppNotifications INTEGER DEFAULT 1,
        quizReminders INTEGER DEFAULT 1,
        courseUpdates INTEGER DEFAULT 1,
        discussionNotifications INTEGER DEFAULT 1,
        quietHoursEnabled INTEGER DEFAULT 0,
        quietHoursStart TEXT DEFAULT '21:00',
        quietHoursEnd TEXT DEFAULT '09:00',
        notificationSummary INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Discussions table
    db.run(`
      CREATE TABLE IF NOT EXISTS discussions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        tags TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Discussion Replies table
    db.run(`
      CREATE TABLE IF NOT EXISTS discussion_replies (
        id TEXT PRIMARY KEY,
        discussion_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT,
        likes INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES discussions(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Content Modules table
    db.run(`
      CREATE TABLE IF NOT EXISTS content_modules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        "order" INTEGER,
        videoUrl TEXT,
        duration INTEGER DEFAULT 0,
        isPublished INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Quiz Questions table
    db.run(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        questionText TEXT NOT NULL,
        questionType TEXT DEFAULT 'multiple-choice',
        options TEXT,
        correctAnswer TEXT,
        explanation TEXT,
        difficulty TEXT DEFAULT 'medium',
        "order" INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);

    // Quiz Attempts table (for detailed attempt tracking with scoring)
    db.run(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        attempt_number INTEGER,
        answers TEXT,
        total_time_seconds INTEGER,
        score_percentage REAL,
        passed INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Conversations table for AI tutoring
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Conversation messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message_type TEXT,
        content TEXT NOT NULL,
        tokens_used INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // AI Cache table
    db.run(`
      CREATE TABLE IF NOT EXISTS ai_cache (
        id TEXT PRIMARY KEY,
        query_hash TEXT UNIQUE NOT NULL,
        response TEXT,
        cache_type TEXT,
        course_id TEXT,
        ttl DATETIME,
        hit_count INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Generated Content table
    db.run(`
      CREATE TABLE IF NOT EXISTS generated_content (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        content_type TEXT,
        title TEXT,
        content TEXT,
        version INTEGER DEFAULT 1,
        language TEXT DEFAULT 'en',
        tokens_used INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Flashcard Sets table
    db.run(`
      CREATE TABLE IF NOT EXISTS flashcard_sets (
        id TEXT PRIMARY KEY,
        generated_content_id TEXT NOT NULL,
        title TEXT,
        card_count INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (generated_content_id) REFERENCES generated_content(id)
      )
    `);

    // Flashcards table
    db.run(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        front TEXT,
        back TEXT,
        difficulty TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES flashcard_sets(id)
      )
    `);

    console.log('Database tables created successfully');
  });
};

// Promisify database operations for easier use
const dbPromise = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Create tables on startup
createTables();

const connectDB = async () => {
  console.log('SQLite database connected');
  return db;
};

const disconnectDB = async () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else {
        console.log('Database disconnected');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  dbPromise,
  connectDB,
  disconnectDB
};
