# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Endpoints Overview

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

### Users
- `GET /users/profile` - Get user profile (Protected)
- `PUT /users/profile` - Update user profile (Protected)
- `GET /users/:id` - Get user details (Protected, Admin)

### Courses
- `GET /courses` - List all courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create a course (Protected, Admin)
- `PUT /courses/:id` - Update a course (Protected, Admin)
- `DELETE /courses/:id` - Delete a course (Protected, Admin)

### Enrollments
- `POST /enrollments` - Enroll in a course (Protected)
- `GET /enrollments` - Get user's enrollments (Protected)
- `GET /enrollments/:courseId` - Get enrollment details (Protected)

### Content
- `GET /courses/:courseId/content` - Get course content
- `POST /courses/:courseId/content` - Add content (Protected, Admin)
- `PUT /content/:id` - Update content (Protected, Admin)

### Quizzes
- `GET /courses/:courseId/quizzes` - Get course quizzes
- `POST /courses/:courseId/quizzes` - Create quiz (Protected, Admin)
- `POST /quizzes/:id/submit` - Submit quiz answers (Protected)

### Certification
- `GET /users/certifications` - Get user certificates (Protected)
- `POST /courses/:courseId/certification` - Take certification test (Protected)
- `GET /certifications/:id` - Get certification details (Protected)

### Admin
- `GET /admin/analytics` - Get platform analytics (Protected, Admin)
- `GET /admin/users` - List all users (Protected, Admin)
- `GET /admin/reports` - Get reports (Protected, Admin)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Examples

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
}
```

### Get Courses
```
GET /courses

Response:
{
  "success": true,
  "data": [
    {
      "id": "course_1",
      "title": "Introduction to AI",
      "description": "Learn AI basics",
      "instructor": "Jane Smith",
      "enrolledStudents": 150
    }
  ]
}
```

---
**Note**: More detailed endpoint documentation will be added as the project develops.
