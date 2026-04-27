# AIEduAssist - Quick Start Card 🚀

## Status: ✅ READY TO TEST

**Frontend**: ✅ 13 pages (Vite + React)  
**Backend**: ✅ 90 endpoints (Express.js)  
**Database**: ⏳ MongoDB (setup required)  

---

## Get Started in 3 Steps

### Step 1️⃣: Setup MongoDB
```bash
# Option A: Local (Recommended)
brew install mongodb-community
brew services start mongodb-community

# Option B: Cloud (MongoDB Atlas)
# 1. Go to mongodb.com/cloud/atlas
# 2. Create free cluster & get connection string
# 3. Add to backend/.env as MONGODB_URI=...
```

### Step 2️⃣: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ You should see: `Server running on http://localhost:5000`

### Step 3️⃣: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ You should see: `Local: http://localhost:5173/`

---

## View Your App

🌐 **Open**: http://localhost:5173

You'll see the login page. Create an account and explore! 🎉

---

## Quick Test Flow (20 mins)

1. **Register** - Create test account
2. **Login** - Access dashboard
3. **Browse Courses** - See available courses
4. **Enroll** - Sign up for a course
5. **View Analytics** - See your learning path
6. **Take Quiz** - Complete a quiz
7. **Check Certificates** - View earned certificates
8. **Join Discussion** - Participate in forums

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB won't start | `brew services restart mongodb-community` |
| Port 5000 in use | `lsof -ti:5000 \| xargs kill -9` |
| CORS errors | Check FRONTEND_URL in backend/.env |
| Dependencies fail | `rm -rf node_modules && npm install` |

---

## Test with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Pass123"}'

# Login (copy token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123"}'

# Get Profile (replace TOKEN)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## Files to Know

- **TESTING_GUIDE.md** - Comprehensive testing guide
- **setup.sh** - Automated setup (run: `bash setup.sh`)
- **backend/.env** - Configuration (create from .env.example)
- **frontend/src** - React code
- **backend/src** - Express code

---

## System Features ✨

- 👤 User authentication & profiles
- 📚 90+ courses with progress tracking
- 📊 Analytics dashboard & learning paths
- 🧪 Quiz system with scoring
- 🏆 Certificate management
- 💬 Discussion forums
- 🔔 Notifications & preferences
- 📈 Recommendations & insights

---

## Success Checklist

- [ ] MongoDB running
- [ ] Backend started (no errors)
- [ ] Frontend running (loaded in browser)
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Dashboard displays correctly
- [ ] No red errors in console

---

## Resources

- Backend API: http://localhost:5000
- Frontend App: http://localhost:5173
- MongoDB: localhost:27017 (or atlas.mongodb.com)
- Docs: See TESTING_GUIDE.md & FRONTEND_WEEK3_COMPLETE.md

---

## Support

All documentation is in the project root:
- TESTING_GUIDE.md (Comprehensive)
- FRONTEND_WEEK3_COMPLETE.md (Pages details)
- BACKEND_WEEK2_COMPLETE.md (API details)
- README.md (General info)

---

**Ready? Start with Step 1 above! 🎯**
