# AIEduAssist - AI-Powered Education Website

An intelligent education platform that leverages AI (Groq API) to provide personalized learning experiences with courses, interactive content, progress tracking, and certification tests.

## Project Overview

AIEduAssist is a comprehensive e-learning platform with the following features:

### User Features
- **Authentication**: Secure login/registration system
- **Dashboard**: Personalized learning dashboard
- **Courses**: Browse and enroll in various courses
- **Learning Content**: Interactive course material and onboarding
- **Quizzes**: Multiple-choice questions to test knowledge
- **Certification**: Final tests leading to course certification

### Admin Features
- **Course Management**: Create, update, and delete courses
- **User Analytics**: Track student progress and engagement
- **Content Management**: Manage learning materials
- **Performance Monitoring**: View certification and test results

## Technology Stack

### Backend
- **Runtime**: Node.js / Python (TBD)
- **Framework**: Express.js / FastAPI (TBD)
- **Database**: MongoDB / PostgreSQL (TBD)
- **Authentication**: JWT
- **AI Integration**: Groq API
- **Security**: Encryption, Rate Limiting, Input Validation

### Frontend
- **Framework**: React / Vue.js (TBD)
- **Build Tool**: Vite / Next.js (TBD)
- **State Management**: Context API / Redux (TBD)
- **Styling**: Tailwind CSS (TBD)
- **API Client**: Axios

## Project Structure

```
AIEduAssist/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Express/FastAPI middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS/styling
│   │   ├── utils/          # Utility functions
│   │   ├── context/        # Context providers
│   │   └── hooks/          # Custom React hooks
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── DATABASE.md         # Database schema
│   ├── ARCHITECTURE.md     # System architecture
│   └── SETUP.md            # Setup guide
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ / Python 3.8+
- Git
- Groq API Key

### Installation

1. Clone the repository
```bash
git clone https://github.com/kmindsit/AIEduAssist.git
cd AIEduAssist
git checkout development
```

2. Backend Setup
```bash
cd backend
npm install
# or
pip install -r requirements.txt

cp .env.example .env
# Fill in your environment variables
```

3. Frontend Setup
```bash
cd frontend
npm install

cp .env.example .env
# Fill in your environment variables
```

## Development Workflow

### Creating a Feature Branch
```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

### Committing Changes
```bash
git add .
git commit -m "feat: description of changes"
git push origin feature/your-feature-name
```

### Creating a Pull Request
- Push to your feature branch
- Create a PR to `development` branch
- Request review from your collaborator
- Merge after approval

### Never Push Directly to Main
All changes must go through `development` branch first.

## API Documentation
See [docs/API.md](docs/API.md) for detailed API endpoints and specifications.

## Database Schema
See [docs/DATABASE.md](docs/DATABASE.md) for database structure.

## System Architecture
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design overview.

## Contributors
- **Backend Developer**: [Your Name]
- **Frontend Developer**: [Collaborator Name]

## Security Notes
- Never commit `.env` files with real secrets
- Use `.env.example` as a template
- Implement rate limiting on all APIs
- Use HTTPS in production
- Validate and sanitize all user inputs
- Keep dependencies updated

## Support
For issues or questions, create an issue in the GitHub repository.

## License
[TBD]
