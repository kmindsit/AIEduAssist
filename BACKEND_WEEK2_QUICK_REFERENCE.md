# AIEduAssist Backend - Week 2 API Quick Reference

## 🚀 Quick Start

All endpoints require authentication (JWT token) unless marked as public.

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

---

## 📬 Notifications API

### Get All Notifications
```bash
GET /notifications?limit=20&page=1&isRead=false&type=enrollment_confirmed
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "type": "course_completed",
      "title": "Course Completed",
      "message": "You've completed...",
      "isRead": false,
      "priority": "high",
      "createdAt": "2026-04-16T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Get Unread Count
```bash
GET /notifications/unread/count
```

**Response**:
```json
{
  "success": true,
  "unreadCount": 12
}
```

### Mark as Read
```bash
PUT /notifications/:notificationId/read
```

### Mark All as Read
```bash
PUT /notifications/all/read
```

### Delete Notification
```bash
DELETE /notifications/:notificationId
```

---

## 🎓 Certificates API

### Get User Certificates
```bash
GET /certificates?limit=10&page=1
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "certificateNumber": "CERT-1713276000-ABC123DE",
      "courseTitle": "Advanced JavaScript",
      "issueDate": "2026-04-16",
      "score": 95,
      "status": "issued",
      "verificationUrl": "http://localhost:3000/verify/CERT-..."
    }
  ]
}
```

### Get Certificate Details
```bash
GET /certificates/:certificateId
```

### Verify Certificate (Public)
```bash
GET /certificates/verify/:certificateNumber
```

**Response**:
```json
{
  "success": true,
  "data": {
    "certificateNumber": "CERT-...",
    "userName": "John Doe",
    "courseName": "JavaScript Mastery",
    "issueDate": "2026-04-16",
    "verificationDate": "2026-04-16",
    "isValid": true
  }
}
```

### Award Certificate (Instructor)
```bash
POST /certificates
Content-Type: application/json
Authorization: Bearer <instructor_token>

{
  "userId": "...",
  "courseId": "...",
  "score": 92,
  "metadata": {
    "completionPercentage": 100,
    "quizzesCompleted": 5,
    "assignmentsCompleted": 3
  }
}
```

### Generate PDF
```bash
POST /certificates/:certificateId/pdf
```

---

## 💬 Discussions API

### Get Course Discussions
```bash
GET /discussions/courses/:courseId?category=doubt&sortBy=createdAt&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "How to optimize database queries?",
      "content": "I'm struggling with...",
      "author": {
        "name": "Alice",
        "avatar": "..."
      },
      "category": "doubt",
      "isPinned": true,
      "views": 324,
      "upvotes": 12,
      "replyCount": 5,
      "answerCount": 1,
      "createdAt": "2026-04-16T..."
    }
  ]
}
```

### Create Discussion
```bash
POST /discussions/courses/:courseId
Content-Type: application/json

{
  "title": "Best practices for async/await",
  "content": "What are the best practices...",
  "category": "general",
  "tags": ["async", "javascript", "best-practices"]
}
```

### Get Discussion Details
```bash
GET /discussions/:courseId/discussions/:discussionId
```

### Reply to Discussion
```bash
POST /discussions/:courseId/discussions/:discussionId/reply
Content-Type: application/json

{
  "content": "You can use Promise.all()...",
  "isAnswer": true
}
```

### Upvote Discussion
```bash
POST /discussions/:courseId/discussions/:discussionId/upvote
```

**Response**:
```json
{
  "success": true,
  "upvoted": true,
  "data": {
    "upvotes": 13
  }
}
```

### Pin Discussion (Instructor)
```bash
PUT /discussions/:courseId/discussions/:discussionId/pin
Authorization: Bearer <instructor_token>
```

---

## 📚 Content Management API

### Get Course Modules
```bash
GET /content/courses/:courseId
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Introduction to Node.js",
      "type": "video",
      "orderIndex": 0,
      "duration": 45,
      "difficulty": "beginner",
      "isPublished": true,
      "avgRating": 4.5,
      "content": {
        "videoUrl": "https://..."
      }
    }
  ]
}
```

### Create Content Module (Instructor)
```bash
POST /content/courses/:courseId/modules
Content-Type: application/json
Authorization: Bearer <instructor_token>

{
  "title": "Module 1: Basics",
  "description": "Learn the basics...",
  "type": "video",
  "duration": 60,
  "difficulty": "beginner",
  "content": {
    "videoUrl": "https://youtube.com/..."
  },
  "resources": [
    {
      "title": "Source Code",
      "url": "https://...",
      "type": "github"
    }
  ]
}
```

### Update Module
```bash
PUT /content/courses/:courseId/modules/:moduleId
Content-Type: application/json
Authorization: Bearer <instructor_token>

{
  "title": "Updated Title",
  "duration": 75
}
```

### Publish Module
```bash
POST /content/courses/:courseId/modules/:moduleId/publish
Authorization: Bearer <instructor_token>
```

### Add Module Feedback
```bash
POST /content/courses/:courseId/modules/:moduleId/feedback
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great explanation!"
}
```

### Reorder Modules
```bash
POST /content/courses/:courseId/modules/reorder
Authorization: Bearer <instructor_token>

{
  "moduleIds": ["moduleId1", "moduleId2", "moduleId3"]
}
```

---

## ⚙️ Notification Preferences API

### Get Preferences
```bash
GET /preferences
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "emailNotifications": {
      "type": true,
      "courseUpdates": true,
      "quizReminders": true,
      "discussionReplies": true,
      "promotions": false
    },
    "pushNotifications": {
      "type": true,
      "courseUpdates": true
    },
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00",
      "timezone": "EST"
    },
    "frequency": "immediate"
  }
}
```

### Update Preferences
```bash
PUT /preferences
Content-Type: application/json

{
  "emailNotifications": {
    "courseUpdates": false,
    "promotions": true
  },
  "frequency": "daily"
}
```

### Toggle Email Notifications
```bash
PUT /preferences/email/toggle
Content-Type: application/json

{
  "type": "courseUpdates",
  "enabled": false
}
```

### Set Quiet Hours
```bash
PUT /preferences/quiet-hours
Content-Type: application/json

{
  "enabled": true,
  "startTime": "22:00",
  "endTime": "08:00",
  "timezone": "America/New_York"
}
```

### Enable Notification Summary
```bash
POST /preferences/summary/enable
Content-Type: application/json

{
  "frequency": "weekly"
}
```

### Disable Notification Summary
```bash
POST /preferences/summary/disable
```

---

## 🔒 Authentication Required

All endpoints except `/certificates/verify/:certificateNumber` require:
```
Header: Authorization: Bearer <access_token>
```

---

## 📊 Notification Types

```
- enrollment_confirmed
- course_started
- course_completed
- quiz_available
- quiz_reminder
- new_discussion
- discussion_reply
- certificate_awarded
- course_update
- instructor_message
- payment_confirmed
- system_alert
```

---

## 🎯 Discussion Categories

```
- general
- doubt
- resource
- announcement
- project
```

---

## 📝 Content Module Types

```
- video
- document
- article
- interactive
- assignment
- quiz
```

---

## 💾 Database Collection Sizes (Estimated)

| Collection | Size | Growth |
|-----------|------|--------|
| Notification | 1M+ | 100K/day |
| Certificate | 100K+ | 1K/day |
| Discussion | 500K+ | 5K/day |
| ContentModule | 50K+ | 100/day |

---

## 📋 Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 429 Rate Limited
```json
{
  "success": false,
  "message": "Rate limit exceeded"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🧪 Example Workflow

### 1. User Enrolls in Course
```bash
POST /enrollments
```

### 2. User Receives Notification
```bash
# Automatically created in Notification collection
GET /notifications
# Returns enrollment_confirmed notification
```

### 3. User Sets Preferences
```bash
PUT /preferences
# Disable quiz reminders
```

### 4. User Views Course Content
```bash
GET /content/courses/:courseId
```

### 5. User Completes Course & Gets Certificate
```bash
# Automatically awarded when progress = 100%
GET /certificates
# Returns new certificate
```

### 6. User Shares Certificate
```bash
GET /certificates/verify/:certificateNumber
# Public verification page
```

---

## 🚀 Performance Tips

1. **Use pagination** for list endpoints: `?limit=20&page=1`
2. **Cache responses** in frontend for 5-10 minutes
3. **Implement pagination** in discussion threads
4. **Batch notification reads** instead of individual updates
5. **Use search with filters** instead of loading all data

---

## 📱 Mobile Integration

All endpoints support:
- JSON request/response
- Pagination for large datasets
- Partial data retrieval with specific fields
- Sorting and filtering

---

**Generated**: April 16, 2026  
**API Version**: v1  
**Status**: Production Ready

For issues or questions, refer to BACKEND_WEEK2_COMPLETE.md
