# Backend Development Guide

## Setup Instructions

### Prerequisites
- Node.js 16+ 
- npm or yarn
- SQLite3 (included with sqlite3 npm package)

### Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set at minimum:
   ```
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```
   
   This creates sample data:
   - 1 Admin user
   - 2 Instructor users  
   - 5 Student users
   - 25 Courses across 5 categories
   - Sample enrollments, quizzes, and certificates

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Server runs on `http://localhost:5000`

---

## Database Architecture

### SQLite Database Schema

Located at: `/data/aieduassist.db` (auto-created)

**Tables:**
- `users` - User accounts with roles (student, instructor, admin)
- `courses` - Course catalog with instructor association
- `enrollments` - User course enrollments with progress tracking
- `quizzes` - Course quizzes with questions
- `quiz_questions` - Individual quiz questions
- `quiz_results` - Quiz submission results
- `certificates` - Course completion certificates
- `notifications` - User notifications
- `notification_preferences` - User notification settings
- `discussions` - Course discussion forum
- `discussion_replies` - Replies to discussions
- `content_modules` - Course content modules (videos, documents, etc.)

### Key Features

- **Foreign Key Constraints**: All relationships enforced at DB level
- **Timestamps**: All records have `createdAt` and `updatedAt`
- **UUIDs**: All IDs are UUIDs for distributed systems compatibility
- **Indexes**: Optimized for common queries

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express app setup
│   ├── config/
│   │   ├── sqlite.js            # Database configuration
│   │   ├── groqAPI.js           # Groq AI integration
│   │   └── database.js          # MongoDB config (deprecated)
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── userController.js
│   │   └── ... (other controllers)
│   ├── models/                   # SQLite model classes
│   │   ├── UserSQLite.js
│   │   ├── CourseSQLite.js
│   │   ├── EnrollmentSQLite.js
│   │   └── ... (other models)
│   ├── routes/                   # API route definitions
│   ├── middleware/               # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   └── validation.js        # Input validation
│   └── utils/                    # Helper functions
│       ├── tokenManager.js      # JWT & password utilities
│       ├── validators.js        # Input validators
│       ├── emailService.js
│       ├── cacheManager.js
│       └── rateLimiter.js
├── tests/
│   └── integration.test.js      # Integration tests
├── scripts/
│   └── seedDatabase.js          # Database seeding script
├── .env.example                 # Environment template
├── package.json
└── README.md
```

---

## API Architecture

### Authentication Flow

1. User registers or logs in
2. Server generates JWT access token (1 day) and refresh token (30 days)
3. Client stores tokens (preferably in secure storage)
4. For protected routes, client sends: `Authorization: Bearer <accessToken>`
5. Server validates token in auth middleware
6. When access token expires, client uses refresh token to get new one

### Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Status Codes

- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (e.g., duplicate email)
- `500`: Internal Server Error

---

## Controller Development

Each controller follows this pattern:

```javascript
const ModelSQLite = require('../models/ModelSQLite');

exports.getItems = async (req, res) => {
  try {
    // Business logic
    const items = await ModelSQLite.findAll();
    
    res.status(200).json({
      success: true,
      message: 'Items retrieved successfully',
      data: { items }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve items',
      statusCode: 500
    });
  }
};
```

### Best Practices

1. **Always use try-catch** for async operations
2. **Validate input** before using it
3. **Check authorization** (user role, ownership)
4. **Return consistent response format**
5. **Log errors for debugging**
6. **Use meaningful error messages**

---

## SQLite Model Pattern

All SQLite models follow a consistent class-based pattern:

```javascript
class EntitySQLite {
  // CREATE
  static async create(data) {
    const id = uuidv4();
    // ... INSERT SQL
    return this.findById(id);
  }

  // READ
  static async findById(id) {
    return dbPromise.get('SELECT * FROM entity WHERE id = ?', [id]);
  }

  static async findAll(filters = {}) {
    // ... build query with filters
    return dbPromise.all(query, params);
  }

  // UPDATE
  static async update(id, updateData) {
    // ... UPDATE SQL
    return this.findById(id);
  }

  // DELETE
  static async delete(id) {
    return dbPromise.run('DELETE FROM entity WHERE id = ?', [id]);
  }
}
```

---

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Integration tests only
npm run test:integration

# With coverage report
npm test -- --coverage
```

---

## Common Development Tasks

### Add a New API Endpoint

1. **Create/Update Model** (`src/models/EntitySQLite.js`)
   - Add database method if needed

2. **Create/Update Controller** (`src/controllers/entityController.js`)
   - Add exported function with route logic

3. **Add Route** (`src/routes/entity.js`)
   - Connect controller function to HTTP method

4. **Register Route** (`src/app.js`)
   - Add `app.use('/api/entity', require('./routes/entity'))`

5. **Test the Endpoint**
   - Use curl, Postman, or integration tests

### Add Database Table

1. Update `src/config/sqlite.js` - add `CREATE TABLE` in `createTables()`
2. Create corresponding `EntitySQLite.js` model class
3. Seed sample data in `scripts/seedDatabase.js` if needed
4. Run `npm run seed` to apply changes

### Modify Authentication

- JWT configuration: `src/utils/tokenManager.js`
- Auth middleware: `src/middleware/auth.js`
- Register/login: `src/controllers/authController.js`

---

## AI Integration (Groq API)

The platform integrates Groq for AI features:

```javascript
const { generateQuizQuestions, generateLearningRecommendation } = require('../config/groqAPI');

// Generate quiz questions
const questions = await generateQuizQuestions('Machine Learning', 5);

// Generate personalized recommendations
const recommendation = await generateLearningRecommendation({
  completedCourses: ['AI 101'],
  currentCourses: ['ML Advanced'],
  strengths: ['Python'],
  improvements: ['Mathematics']
});
```

**Note:** GROQ_API_KEY must be set in `.env` for these to work.

---

## Debugging

### Enable Debug Logging

Set environment variable:
```bash
LOG_LEVEL=debug npm run dev
```

### Check Database Directly

```bash
# Open SQLite shell
sqlite3 data/aieduassist.db

# View tables
.tables

# Query data
SELECT * FROM users LIMIT 5;
```

### Common Issues

**"GROQ_API_KEY is not set"**
- Add `GROQ_API_KEY` to `.env` file

**"Token verification failed"**
- Check `JWT_SECRET` matches in `.env`
- Verify token format: `Authorization: Bearer <token>`

**"User not found"**
- Ensure user exists in database
- Check user ID format (should be UUID)

---

## Performance Optimization

### Database Optimization

- Use indexes on frequently queried columns (already configured)
- Limit joins in complex queries
- Paginate large result sets
- Use `LIMIT` and `OFFSET` for pagination

### Caching

- Use `cacheManager.js` for frequently accessed data
- Cache course catalogs, popular courses
- Invalidate cache on data updates

### Rate Limiting

- Configured in `utils/rateLimiter.js`
- Prevents API abuse
- Returns 429 Too Many Requests when exceeded

---

## Deployment Checklist

Before deploying to production:

- [ ] Set all required environment variables
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Run database migrations
- [ ] Verify all endpoints work
- [ ] Run test suite
- [ ] Check error logging
- [ ] Setup monitoring/alerts
- [ ] Backup database

---

## Useful Commands

```bash
# Start development server with auto-reload
npm run dev

# Seed database with sample data
npm run seed

# Run tests
npm test

# Run integration tests only
npm run test:integration

# Production start
npm start

# View database
sqlite3 data/aieduassist.db
```

---

## Getting Help

- Check the [API documentation](../../docs/API.md)
- Review existing controller patterns
- Check error logs in console
- Run integration tests to verify setup
