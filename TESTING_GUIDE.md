# AIEduAssist - Complete Testing Guide 🚀

**Status**: ✅ Ready for Testing  
**Date**: April 27, 2026  
**Frontend Build**: Vite + React 18 (Ready)  
**Backend Build**: Express.js (Ready)  
**Database**: MongoDB (Needs Configuration)  

---

## Quick Start (5 minutes)

### Step 1: Set Up Environment Variables

Create a `.env` file in the `backend/` folder:

```bash
# Backend Port
BACKEND_PORT=5000
NODE_ENV=development

# MongoDB (Local or MongoDB Atlas)
# For Local MongoDB:
DB_HOST=localhost
DB_PORT=27017
DB_NAME=aieduassist
DB_USER=
DB_PASSWORD=

# For MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aieduassist

# JWT Configuration
JWT_SECRET=your_secret_key_change_this_in_production_12345
JWT_EXPIRY=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Groq AI API (Optional, but needed for AI features)
GROQ_API_KEY=your_groq_api_key_here

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Step 2: Configure MongoDB

You have two options:

#### Option A: Local MongoDB (Simple - Recommended for Testing)
```bash
# Install MongoDB Community Edition
# macOS:
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh  # Should connect successfully
```

#### Option B: MongoDB Atlas (Cloud - Free)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get connection string and update `MONGODB_URI` in .env

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
> nodemon src/app.js
[nodemon] restarting due to changes...
[nodemon] starting `node src/app.js`
Server running on http://localhost:5000
✅ Database connected successfully
```

### Step 4: Start Frontend Dev Server

In a new terminal:

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 456 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 5: Open Browser and Test

Open **http://localhost:5173** in your browser 🎉

---

## 📋 Manual Testing Checklist

### Authentication Flow
- [ ] Go to Register page
- [ ] Create new account with:
  - Name: Test User
  - Email: test@example.com
  - Password: TestPass123
  - Role: Student
- [ ] Should redirect to Dashboard
- [ ] Go to Login page
- [ ] Login with created credentials
- [ ] Should see Dashboard with Welcome message

### Dashboard & Navigation
- [ ] Dashboard displays correctly
- [ ] Navigation menu is accessible
- [ ] All pages load without errors
- [ ] Header shows user info
- [ ] Logout button works

### Courses
- [ ] Browse courses page loads
- [ ] Can see list of courses
- [ ] Can click on course for details
- [ ] Enroll button works
- [ ] Progress bar displays

### Quizzes
- [ ] Can access quiz for enrolled course
- [ ] Quiz questions display
- [ ] Can select answers
- [ ] Can submit quiz
- [ ] See quiz results

### Analytics Dashboard
- [ ] Analytics page loads
- [ ] Shows user statistics:
  - [ ] Enrolled courses
  - [ ] Completed courses
  - [ ] Average progress
  - [ ] Study hours
- [ ] Learning path visualizes
- [ ] Recommendations display
- [ ] Weak areas identified

### Certificates
- [ ] Certificate page loads
- [ ] Shows earned certificates (after completing courses)
- [ ] Can view certificate details
- [ ] PDF download button exists

### Discussions
- [ ] Discussion page loads for course
- [ ] Can create new discussion
- [ ] Can view discussions
- [ ] Can reply to discussions
- [ ] Can upvote discussions

### Notifications
- [ ] Notification center opens
- [ ] Shows list of notifications
- [ ] Can mark as read
- [ ] Can delete notifications
- [ ] Settings page shows

### Profile
- [ ] Profile page loads
- [ ] Can view user info
- [ ] Can edit profile
- [ ] Changes save

---

## 🧪 API Testing (Postman/curl)

### Setup Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Import requests or create manually

### Example API Calls

#### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "student"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response includes `accessToken` and `refreshToken`

#### 3. Get User Profile
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Get User Analytics
```bash
curl -X GET http://localhost:5000/api/users/analytics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5. Get Courses
```bash
curl -X GET http://localhost:5000/api/courses \
  -H "Content-Type: application/json"
```

#### 6. Get Learning Path
```bash
curl -X GET http://localhost:5000/api/users/analytics/learning-path \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 7. Get Recommendations
```bash
curl -X GET http://localhost:5000/api/users/recommendations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

**Module Not Found Errors**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Frontend Issues

**Port Already in Use**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev  # Specify port or use next available
```

**Module Errors**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Vite Build Issues**
```bash
npm run build
npm run preview  # Preview production build
```

### API Connection Issues

**CORS Errors**
- Check that frontend URL matches `FRONTEND_URL` in `.env`
- Backend CORS should allow `http://localhost:3000` by default

**Authentication Errors**
- Ensure token is passed in Authorization header
- Format: `Authorization: Bearer {token}`
- Token should be from login response

**Database Errors**
- Verify MongoDB is running
- Check connection string in `.env`
- Verify database credentials

---

## 📊 Testing Scenarios

### Scenario 1: Complete Learning Path
1. Register as student
2. Browse and enroll in 3 courses
3. View analytics dashboard
4. Start quiz on one course
5. Complete course
6. Check certificate page
7. View updated analytics

### Scenario 2: Discussion Participation
1. Enroll in a course
2. Navigate to discussions
3. Create new discussion thread
4. Reply to another discussion
5. Upvote responses
6. Verify notifications

### Scenario 3: Analytics Deep Dive
1. Complete multiple courses
2. Take several quizzes
3. View analytics page
4. Check learning path
5. Review recommendations
6. Identify weak areas

### Scenario 4: Instructor Dashboard
1. Register as instructor
2. Create a course
3. Add content and quizzes
4. Enroll students (optional: test with another account)
5. View course analytics
6. Issue certificates

---

## 📦 Available Endpoints Summary

### Authentication (8 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/verify-email
- POST /api/auth/resend-verification

### Users (12 endpoints)
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/analytics
- GET /api/users/analytics/learning-path
- GET /api/users/analytics/course-progress
- GET /api/users/analytics/quiz-performance
- GET /api/users/recommendations
- GET /api/users/recommendations/next-courses
- GET /api/users/recommendations/weak-areas
- And more...

### Courses (8+ endpoints)
- GET /api/courses
- GET /api/courses/:id
- POST /api/courses (Instructor)
- PUT /api/courses/:id (Instructor)
- DELETE /api/courses/:id (Instructor)
- GET /api/courses/trending
- GET /api/courses/:id/analytics (Instructor)

### Quizzes (10+ endpoints)
- GET /api/quizzes
- GET /api/quizzes/:id
- POST /api/quizzes (Instructor)
- POST /api/quizzes/:id/submit
- GET /api/quizzes/:id/results

### More Systems (90 total endpoints)
- Certificates
- Discussions
- Notifications
- Content Management
- Preferences
- Admin functions

---

## 🎯 Performance Tips

### For Better Testing Experience

1. **Use smaller datasets initially**
   - Register 2-3 users
   - Create 5-10 courses
   - Start with basic operations

2. **Check browser console**
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for API calls

3. **Monitor backend logs**
   - Watch terminal where `npm run dev` is running
   - Check for error messages
   - Verify database queries

4. **Use VS Code REST Client**
   - Extension: REST Client
   - Create `.http` files for API testing
   - Test without leaving editor

---

## 🚀 Production Testing

Once basic testing is complete, prepare for:

### Build Frontend
```bash
cd frontend
npm run build  # Creates dist/ folder
```

### Build Backend
- No build step needed for Node.js
- Just ensure all dependencies installed

### Docker Testing (Optional)
```bash
docker-compose up  # If docker-compose.yml exists
```

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't connect to backend | Ensure backend is running on port 5000 |
| Login not working | Check MongoDB connection |
| CORS errors | Verify FRONTEND_URL in .env |
| Slow page loads | Check network in DevTools |
| Can't enroll in course | Ensure you're logged in as student |
| Can't create course | Ensure you're logged in as instructor |
| Analytics empty | Need to complete courses first |

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view dashboard
- [ ] Can browse courses
- [ ] Can enroll in course
- [ ] Can view analytics
- [ ] Can participate in discussions
- [ ] Can take quizzes
- [ ] Can view certificates
- [ ] Can access notifications
- [ ] All pages responsive on mobile
- [ ] No console errors
- [ ] No API errors in Network tab

---

## 📝 Notes for Testing

- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:5000
- Database: MongoDB (local or Atlas)
- All endpoints require proper authentication
- Admin features need admin role
- Instructor features need instructor role

---

**Happy Testing! 🎉**

For issues or questions, check the documentation files:
- FRONTEND_WEEK3_COMPLETE.md
- BACKEND_WEEK2_COMPLETE.md
- WEEK1_2_SUMMARY.md

