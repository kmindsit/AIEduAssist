# AIEduAssist - Test Credentials & Setup Guide

## 🔑 Current Status

**Backend:** ✅ Running on http://localhost:5000  
**Frontend:** ✅ Running on http://localhost:3000  
**Database:** ⏳ **Requires Setup** (MongoDB connection needed for full testing)

---

## 📋 Test Credentials

### Default Test Account (Once Database is Connected)

| Field | Value |
|-------|-------|
| **Email** | `test@test.com` |
| **Password** | `TestPass123` |
| **Name** | Test User |
| **Role** | Student (Default) |

### Password Requirements

- **Minimum 8 characters**
- **At least 1 uppercase letter** (A-Z)
- **At least 1 lowercase letter** (a-z)
- **At least 1 number** (0-9)

❌ **Examples that WON'T work:**
- `Pass123` (only 7 chars)
- `testpass123` (no uppercase)
- `TestPass` (no number)

✅ **Examples that WILL work:**
- `TestPass123`
- `MyPassword99`
- `Secure2024Pass`

---

## 🚀 Setting Up MongoDB for Testing

### Option 1: MongoDB Atlas (Cloud - RECOMMENDED) ⭐

**Best for:** Easy testing, no local installation needed

#### Steps:

1. **Create Free Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Sign Up"
   - Create account with email/password

2. **Create Free Cluster**
   - Click "Build a Database"
   - Select "M0 Free" tier (always free)
   - Choose region closest to you
   - Click "Create Cluster" (takes ~3-5 minutes)

3. **Set Up Database Access**
   - In left sidebar: Security → Database Access
   - Click "Add New Database User"
   - Username: `testuser`
   - Password: `testpass123` (or your choice)
   - Click "Add User"

4. **Set Up Network Access**
   - In left sidebar: Security → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Databases" overview
   - Click "Connect" button on your cluster
   - Choose "Drivers" → "Node.js"
   - Copy the connection string
   - Example: `mongodb+srv://testuser:testpass123@cluster0.abc123.mongodb.net/aieduassist?retryWrites=true&w=majority`

6. **Update .env File**
   ```bash
   # Edit: backend/.env
   MONGODB_URI=mongodb+srv://testuser:testpass123@cluster0.abc123.mongodb.net/aieduassist?retryWrites=true&w=majority
   ```

7. **Restart Backend**
   ```bash
   # Kill current backend process
   pkill -f "npm run dev"
   
   # Restart it
   cd backend && npm run dev
   ```

8. **Test Connection**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@test.com",
       "password": "TestPass123",
       "confirmPassword": "TestPass123"
     }'
   ```

---

### Option 2: Local MongoDB (Requires Installation)

**Best for:** Offline development, no cloud dependency

#### Steps:

1. **Install MongoDB Community Edition**

   **macOS (via Homebrew):**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

   **macOS (via DMG):** https://www.mongodb.com/try/download/community

   **Linux (Ubuntu):**
   ```bash
   sudo apt-get install mongodb
   ```

   **Windows:** Download from https://www.mongodb.com/try/download/community

2. **Start MongoDB Service**

   **macOS:**
   ```bash
   brew services start mongodb-community
   ```

   **Linux:**
   ```bash
   sudo systemctl start mongod
   ```

   **Windows:** MongoDB starts automatically as a service

3. **Update .env File**
   ```bash
   # Edit: backend/.env
   # Comment out MONGODB_URI line:
   # MONGODB_URI=...

   # Uncomment local settings:
   DB_HOST=localhost
   DB_PORT=27017
   DB_NAME=aieduassist
   ```

4. **Restart Backend**
   ```bash
   pkill -f "npm run dev"
   cd backend && npm run dev
   ```

---

## 🧪 Testing the Full Flow

### 1. Register a New User

**Via cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "2026-04-27T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### 2. Login with Credentials

**Via cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### 3. Access Protected Route (with JWT Token)

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Test via Frontend UI

1. Open http://localhost:3000 in browser
2. Click "Register"
3. Fill in form:
   - Name: John Doe
   - Email: john@example.com
   - Password: Password123
   - Confirm: Password123
4. Click "Sign Up"
5. You should be redirected to dashboard
6. Click "Logout"
7. Go to Login page
8. Enter credentials:
   - Email: john@example.com
   - Password: Password123
9. Click "Sign In"

---

## 🔗 Quick Links

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **MongoDB Atlas:** https://cloud.mongodb.com
- **API Documentation:** `/backend/README.md`
- **Frontend Guide:** `/frontend/README.md`

---

## ⚠️ Common Issues

### "Operation buffering timed out after 10000ms"
**Cause:** MongoDB connection not established  
**Solution:** 
1. Check MongoDB is running
2. Verify MONGODB_URI in .env is correct
3. Check network/firewall allows MongoDB connection

### "User with this email already exists"
**Solution:** Use a different email address or delete user from database

### "Invalid email format"
**Solution:** Use valid email format: `user@example.com`

### "Password must be at least 8 characters..."
**Solution:** Use password meeting requirements (8+ chars, uppercase, lowercase, number)

---

## 📝 Next Steps

- [ ] Set up MongoDB (Atlas or Local)
- [ ] Update `.env` with MongoDB credentials
- [ ] Restart backend server
- [ ] Register a test user
- [ ] Login to frontend
- [ ] Test courses, quizzes, certificates

**Questions?** Check `TESTING_GUIDE.md` for comprehensive testing instructions.
