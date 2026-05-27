const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize SQLite Database
const { connectDB } = require('./config/sqlite');
connectDB().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// Initialize Express app
const app = express();

// ========================
// Middleware Setup
// ========================

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Request logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========================
// Health Check Route
// ========================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========================
// API Routes (Placeholder)
// ========================
// These will be implemented as we develop each feature

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// User routes
app.use('/api/users', require('./routes/users'));

// Course routes
app.use('/api/courses', require('./routes/courses'));

// Enrollment routes
app.use('/api/enrollments', require('./routes/enrollments'));

// Quiz routes
app.use('/api/quizzes', require('./routes/quizzes'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Notification routes
app.use('/api/notifications', require('./routes/notifications'));

// Certificate routes
app.use('/api/certificates', require('./routes/certificates'));

// Discussion routes
app.use('/api/discussions', require('./routes/discussions'));

// Content routes
app.use('/api/content', require('./routes/content'));

// Preferences routes
app.use('/api/preferences', require('./routes/preferences'));

// AI Tutoring routes
app.use('/api/ai', require('./routes/aiTutoring'));
// ========================
// Error Handling Middleware
// ========================

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404,
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================
// Server Startup
// ========================

const PORT = process.env.BACKEND_PORT || 5000;
const HOST = process.env.BACKEND_HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║          AIEduAssist Backend Server                ║
╠════════════════════════════════════════════════════╣
║ 🚀 Server running on http://${HOST}:${PORT}
║ 📝 Environment: ${process.env.NODE_ENV || 'development'}
║ 🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
╚════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
