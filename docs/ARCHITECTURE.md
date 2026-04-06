# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer (Browser)                   │
│                    React / Vue.js Application                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
│              (Rate Limiting, CORS, Request Logging)             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Server                            │
│              (Node.js/Express or Python/FastAPI)                │
│                                                                  │
│  ├─ Authentication & Authorization (JWT)                        │
│  ├─ Course Management                                           │
│  ├─ User Management                                             │
│  ├─ Quiz & Assessment Engine                                    │
│  ├─ Progress Tracking                                           │
│  └─ Certification System                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Database   │    │  Groq API    │    │   File       │
│ (MongoDB/    │    │  (AI/ML      │    │   Storage    │
│ PostgreSQL)  │    │   Services)  │    │   (S3/Local) │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Frontend Architecture

### Layers
1. **Presentation Layer**
   - Pages (Login, Dashboard, Courses, etc.)
   - Reusable Components (Button, Card, Form, etc.)
   - Layout Components

2. **State Management**
   - Context API / Redux
   - User authentication state
   - Course data
   - User progress

3. **API Integration**
   - Axios/Fetch API
   - Request/Response interceptors
   - Error handling

4. **Utilities & Hooks**
   - Custom React hooks
   - Helper functions
   - Validation logic

### Page Structure
```
Frontend/
├── pages/
│   ├── LoginPage
│   ├── RegisterPage
│   ├── DashboardPage
│   ├── CoursesPage
│   ├── CourseDetailPage
│   ├── ContentPage
│   ├── QuizPage
│   ├── CertificationPage
│   └── AdminDashboard
├── components/
│   ├── Navigation
│   ├── Sidebar
│   ├── CourseCard
│   ├── ProgressBar
│   ├── QuestionCard
│   └── ...
├── context/
│   ├── AuthContext
│   ├── CourseContext
│   └── UserContext
└── hooks/
    ├── useAuth
    ├── useCourse
    └── useFetch
```

## Backend Architecture

### Layers
1. **Route Layer** (`/routes`)
   - Define API endpoints
   - Request validation
   - Route guards (middleware)

2. **Controller Layer** (`/controllers`)
   - Business logic
   - Request processing
   - Response formatting

3. **Model Layer** (`/models`)
   - Database schemas
   - Data validation
   - Database operations

4. **Middleware Layer** (`/middleware`)
   - Authentication (JWT)
   - Authorization (Role-based)
   - Error handling
   - Logging
   - Request validation

5. **Config Layer** (`/config`)
   - Database connection
   - Environment variables
   - Third-party API setup
   - Constants

6. **Utility Layer** (`/utils`)
   - Helper functions
   - JWT token management
   - Password hashing
   - Email sending
   - File upload handling
   - AI prompt engineering

### Backend Structure
```
Backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   ├── quizzes.js
│   │   └── admin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── quizController.js
│   │   ├── certificationController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Quiz.js
│   │   ├── Enrollment.js
│   │   └── Certification.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── logging.js
│   ├── config/
│   │   ├── database.js
│   │   ├── groqAPI.js
│   │   └── constants.js
│   ├── utils/
│   │   ├── tokenManager.js
│   │   ├── encryption.js
│   │   ├── validators.js
│   │   ├── aiPrompts.js
│   │   └── helpers.js
│   └── app.js (Main entry point)
├── package.json
└── .env
```

## Authentication Flow

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │ 1. Submit credentials
       ↓
┌─────────────────────────────┐
│   Backend Auth Controller   │
│ - Validate email/password   │
│ - Hash verification         │
└──────┬──────────────────────┘
       │ 2. Generate JWT token
       ↓
┌─────────────────────────────┐
│   Backend Response          │
│ - Access Token              │
│ - Refresh Token (optional)  │
└──────┬──────────────────────┘
       │ 3. Store token (localStorage)
       ↓
┌─────────────┐
│   User      │
│ (Logged in) │
└─────┬───────┘
      │ 4. Include token in request header
      ↓
┌─────────────────────────────┐
│   Protected Endpoint        │
│ - Verify JWT token         │
│ - Extract user info        │
│ - Execute business logic   │
└─────────────────────────────┘
```

## Data Flow

### Enrollment Process
```
User clicks "Enroll" 
    ↓
Frontend sends POST /enrollments
    ↓
Backend validates user & course
    ↓
Creates enrollment record
    ↓
Updates course student count
    ↓
Returns success + enrollment details
    ↓
Frontend updates dashboard
```

### Quiz Submission
```
User completes quiz & submits
    ↓
Frontend sends POST /quizzes/:id/submit with answers
    ↓
Backend validates quiz & answers
    ↓
Calculates score & passes
    ↓
Stores submission in database
    ↓
If passed → Updates progress
    ↓
Returns results to frontend
```

### Certification Process
```
User takes certification test
    ↓
Submits answers
    ↓
Backend calculates score
    ↓
If passed:
  - Create certificate record
  - Generate certificate PDF
  - Update user completedCourses
    ↓
Returns certificate/result
```

## Security Architecture

### Key Security Measures
1. **Authentication**
   - JWT tokens with expiry
   - Refresh token rotation
   - Secure password hashing (bcrypt)

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - Admin verification

3. **Data Protection**
   - HTTPS/TLS encryption
   - Input validation & sanitization
   - SQL/NoSQL injection prevention
   - XSS prevention

4. **API Security**
   - Rate limiting
   - CORS configuration
   - Request logging
   - API key validation for Groq

5. **Database Security**
   - Connection encryption
   - User permissions
   - Backup strategies

## AI Integration (Groq API)

### Use Cases
1. **Personalized Learning Recommendations**
2. **Question Generation**
3. **Content Summarization**
4. **Quiz Feedback**
5. **Learning Path Optimization**

### Integration Points
```
Backend Routes → Controllers → AI Utility Functions → Groq API
                                       ↓
                            Returns AI-generated content
                                       ↓
                            Stores in database or returns to frontend
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────┐
│      Frontend (Vercel/Netlify)  │
│   - React App                   │
│   - Static Assets               │
└──────────────┬──────────────────┘
               │
               ↓ HTTPS
┌─────────────────────────────────┐
│    Backend (Heroku/AWS)         │
│   - Node.js/Python Server       │
│   - Groq API Integration        │
└──────────────┬──────────────────┘
               │
       ┌───────┴───────┐
       ↓               ↓
┌─────────────┐  ┌──────────────┐
│  Database   │  │  File Storage│
│  (Cloud DB) │  │  (S3/GCS)    │
└─────────────┘  └──────────────┘
```

---
**Note**: This is a foundational architecture. Adjustments will be made as development progresses and requirements become clearer.
