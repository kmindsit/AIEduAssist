# Backend - AIEduAssist

Backend API server for the AIEduAssist platform.

## Technology Stack
- **Runtime**: Node.js (version 16+)
- **Framework**: Express.js
- **Database**: MongoDB / PostgreSQL (TBD)
- **Authentication**: JWT
- **Validation**: Joi / Express-validator
- **AI Integration**: Groq API

## Project Structure

```
backend/
├── src/
│   ├── routes/         # API route definitions
│   ├── controllers/    # Business logic
│   ├── models/         # Database schemas
│   ├── middleware/     # Express middleware
│   ├── config/         # Configuration
│   ├── utils/          # Utilities and helpers
│   └── app.js          # Express app setup
├── tests/              # Test files
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md
```

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in your environment variables
# - Database credentials
# - JWT secret
# - Groq API key
# - Other configuration
```

## Running the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start

# Server runs on http://localhost:5000
```

## Environment Variables

Required variables in `.env`:
- `PORT` - Server port (default: 5000)
- `DB_HOST` - Database host
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `GROQ_API_KEY` - Groq API key

See `.env.example` for all available variables.

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication Routes
```
POST   /auth/register      - Register new user
POST   /auth/login         - Login user
POST   /auth/refresh       - Refresh JWT token
POST   /auth/logout        - Logout user
```

### User Routes
```
GET    /users/profile      - Get user profile (Protected)
PUT    /users/profile      - Update profile (Protected)
GET    /users/:id          - Get user details (Protected, Admin)
```

### Course Routes
```
GET    /courses            - List all courses
GET    /courses/:id        - Get course details
POST   /courses            - Create course (Protected, Admin)
PUT    /courses/:id        - Update course (Protected, Admin)
DELETE /courses/:id        - Delete course (Protected, Admin)
```

### More Routes
See [docs/API.md](../docs/API.md) for complete API documentation.

## Key Dependencies

```json
{
  "express": "REST API framework",
  "dotenv": "Environment variables",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "mongoose": "MongoDB ODM (if using MongoDB)",
  "pg": "PostgreSQL driver (if using PostgreSQL)",
  "joi": "Data validation",
  "cors": "Cross-origin requests",
  "groq-sdk": "Groq AI integration"
}
```

## Development Notes

- All routes must include proper error handling
- Use middleware for authentication and validation
- Implement comprehensive logging
- Follow consistent naming conventions
- Add JSDoc comments for functions
- Write tests for critical functions

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

[TBD - Add deployment instructions]

## Contributors
- Backend Developer

## Support
For issues, contact the development team.
