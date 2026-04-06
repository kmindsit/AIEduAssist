# Database Schema

## Overview
The database will store all user data, courses, enrollments, progress, and certifications.

## Collections/Tables

### Users
```
users {
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: Enum ["student", "instructor", "admin"],
  avatar: String,
  bio: String,
  phone: String,
  location: String,
  enrolledCourses: [ObjectId],
  completedCourses: [ObjectId],
  certificates: [ObjectId],
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean,
  lastLogin: Date
}
```

### Courses
```
courses {
  _id: ObjectId,
  title: String (required),
  description: String,
  instructor: ObjectId (reference to users),
  category: String,
  level: Enum ["beginner", "intermediate", "advanced"],
  duration: Number (in hours),
  thumbnail: String,
  content: [ObjectId] (references to content),
  quizzes: [ObjectId] (references to quizzes),
  certification: ObjectId,
  enrolledStudents: [ObjectId],
  studentCount: Number,
  rating: Number,
  reviews: [Object],
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Content
```
content {
  _id: ObjectId,
  courseId: ObjectId (reference to courses),
  title: String (required),
  type: Enum ["video", "article", "interactive"],
  description: String,
  videoUrl: String,
  articleContent: String,
  duration: Number,
  order: Number,
  resources: [String] (URLs),
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollments
```
enrollments {
  _id: ObjectId,
  userId: ObjectId (reference to users),
  courseId: ObjectId (reference to courses),
  enrollmentDate: Date,
  progress: Number (percentage),
  completedContent: [ObjectId],
  lastAccessedDate: Date,
  status: Enum ["active", "completed", "dropped"],
  certificateEarned: Boolean
}
```

### Quizzes
```
quizzes {
  _id: ObjectId,
  courseId: ObjectId (reference to courses),
  title: String,
  description: String,
  questions: [
    {
      _id: ObjectId,
      questionText: String,
      type: Enum ["multiple-choice", "true-false"],
      options: [String],
      correctAnswer: String,
      explanation: String
    }
  ],
  passingScore: Number (percentage),
  isAssignment: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Submissions
```
quiz_submissions {
  _id: ObjectId,
  userId: ObjectId (reference to users),
  quizId: ObjectId (reference to quizzes),
  courseId: ObjectId (reference to courses),
  answers: [
    {
      questionId: ObjectId,
      selectedAnswer: String,
      isCorrect: Boolean
    }
  ],
  score: Number,
  percentage: Number,
  passed: Boolean,
  submittedAt: Date,
  timeTaken: Number (seconds)
}
```

### Certifications
```
certifications {
  _id: ObjectId,
  courseId: ObjectId (reference to courses),
  title: String,
  passingScore: Number,
  questions: [Object], (reference to certification test questions)
  createdAt: Date,
  updatedAt: Date
}
```

### Certification Results
```
certification_results {
  _id: ObjectId,
  userId: ObjectId (reference to users),
  courseId: ObjectId (reference to courses),
  certificationId: ObjectId,
  score: Number,
  percentage: Number,
  passed: Boolean,
  certificateUrl: String,
  issuedDate: Date,
  expiryDate: Date (if applicable),
  completedAt: Date
}
```

### Admin Logs
```
admin_logs {
  _id: ObjectId,
  adminId: ObjectId (reference to users),
  action: String,
  targetType: String (user, course, quiz, etc),
  targetId: ObjectId,
  changes: Object,
  timestamp: Date,
  ipAddress: String
}
```

## Indexes

```
users: email (unique), role
courses: instructor, category, isPublished
enrollments: userId, courseId, status
quizzes: courseId
quiz_submissions: userId, quizId
certifications: courseId
certification_results: userId, courseId
```

## Relationships

```
User → Enrollments (1 to many)
       → Quiz Submissions (1 to many)
       → Certification Results (1 to many)

Course → Content (1 to many)
      → Quizzes (1 to many)
      → Enrollments (1 to many)
      → Certification (1 to 1)

Quiz → Quiz Submissions (1 to many)
     → Questions (embedded)

Certification → Certification Results (1 to many)
```

---
**Note**: Database schema may evolve as project requirements become clearer. Use this as a foundational blueprint.
