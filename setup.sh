#!/bin/bash

# AIEduAssist Quick Start Script
# This script sets up and starts both frontend and backend

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      AIEduAssist - Quick Start Setup Script               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating backend/.env file...${NC}"
    cat > backend/.env << 'EOF'
# Backend Configuration
BACKEND_PORT=5000
NODE_ENV=development

# Database (Configure for your setup)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=aieduassist

# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aieduassist

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRY=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional: Groq API
GROQ_API_KEY=

# Optional: Email
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASSWORD=
EOF
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Dependencies Status:${NC}"

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Configure MongoDB:"
echo "   - Option A: Run local MongoDB"
echo "     ${GREEN}brew services start mongodb-community${NC}"
echo "   - Option B: Use MongoDB Atlas and update MONGODB_URI in backend/.env"
echo ""
echo "2. Start Backend Server (in terminal 1):"
echo "   ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo "3. Start Frontend Server (in terminal 2):"
echo "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "4. Open in Browser:"
echo "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
