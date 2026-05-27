# AIEduAssist Backend - Complete API Documentation

## Quick Start

**Base URL**: `http://localhost:5000/api`

**Authentication**: Include token in header: `Authorization: Bearer <accessToken>`

---

## Auth Endpoints

### Register User
```
POST /auth/register

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "student"
}

Response (201): Tokens and user object
```

### Login
```
POST /auth/login

{
  "email": "john@example.com",
  "password": "Password123!"
}

Response (200): Tokens and user object
```

### Change Password
```
POST /auth/change-password
Authorization: Bearer <token>

{
  "currentPassword": "...",
  "newPassword": "...",
  "confirmPassword": "..."
}
```

---

## Course Endpoints

### Get All Courses
```
GET /courses?page=1&limit=10&category=AI/ML&difficulty=beginner
```

### Get Course Details
```
GET /courses/:id
```

### Create Course
```
POST /courses
Authorization: Bearer <token>

{
  "title": "Course Title",
  "description": "...",
  "category": "AI/ML",
  "difficulty": "beginner",
  "duration": 20
}
```

### Update Course
```
PUT /courses/:id
Authorization: Bearer <token>
```

### Delete Course
```
DELETE /courses/:id
Authorization: Bearer <token>
```

---

## Enrollment Endpoints

### Enroll in Course
```
POST /enrollments
Authorization: Bearer <token>

{
  "courseId": "..."
}
```

### Get Enrollments
```
GET /enrollments
Authorization: Bearer <token>
```

### Update Progress
```
PUT /enrollments/:courseId/progress
Authorization: Bearer <token>

{
  "progress": 50
}
```

### Complete Course
```
PUT /enrollments/:courseId/complete
Authorization: Bearer <token>
```

---

## Quiz Endpoints

### Submit Quiz
```
POST /quizzes/:quizId/submit
Authorization: Bearer <token>

{
  "answers": ["A", "B", "C", ...]
}
```

### Create Quiz
```
POST /quizzes
Authorization: Bearer <token>

{
  "courseId": "...",
  "title": "Quiz Title",
  "description": "...",
  "questions": [...]
}
```

---

## User Endpoints

### Get Profile
```
GET /users/profile
Authorization: Bearer <token>
```

### Update Profile
```
PUT /users/profile
Authorization: Bearer <token>

{
  "name": "...",
  "bio": "...",
  "avatar": "..."
}
```

---

## Certificate Endpoints

### Get Certificates
```
GET /certificates
Authorization: Bearer <token>
```

### Award Certificate
```
POST /certificates
Authorization: Bearer <token>

{
  "userId": "...",
  "courseId": "..."
}
```

---

## Notification Endpoints

All require: `Authorization: Bearer <token>`

```
GET  /notifications
GET  /notifications/unread/count
PUT  /notifications/:id/read
DELETE /notifications/:id
```

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## Test Credentials

```
Admin: admin@aieduassist.com / Admin123
Instructor: instructor@aieduassist.com / Instructor123
Student: student1@aieduassist.com / Student123
```
