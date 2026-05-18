# Frontend - AIEduAssist

A modern, responsive React-based frontend for the AIEduAssist AI-powered education platform.

**Status**: ✅ Production-ready scaffold complete (Week 1 of Development)

## Technology Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Router**: React Router v6.20.0
- **State Management**: Context API
- **HTTP Client**: Axios 1.6.2
- **Styling**: Tailwind CSS 3.3.6
- **Dev Server**: Vite with HMR

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components (11 files)
│   ├── pages/               # Page components (5 pages)
│   ├── context/             # Context providers (2 contexts)
│   ├── services/            # API services (5 services)
│   ├── hooks/               # Custom React hooks (2 hooks)
│   ├── utils/               # Utility functions (3 utils)
│   ├── layouts/             # Layout wrappers (2 layouts)
│   ├── styles/              # Global styles
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── .env                     # Local env vars
├── .env.example             # Env template
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
├── vite.config.js           # Vite config
└── package.json
```

## Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your backend URL
# VITE_API_URL=http://localhost:5000/api
```

## Running the Application

```bash
# Development server (auto-reload on changes)
npm run dev
# Runs on http://localhost:3000

# Production build
npm run build
# Outputs to dist/ directory

# Preview production build
npm run preview
```

## Implemented Components

### Pages (5)
- **HomePage** - Landing page with features
- **LoginPage** - User login with validation
- **RegisterPage** - User registration
- **DashboardPage** - User enrollment overview
- **CoursesPage** - Course listing with filters

### Components (11)
- **Header** - Navigation with user menu
- **Footer** - Page footer
- **Button** - Multiple variants
- **Input** - Form inputs with error display
- **Card** - Container component
- **Alert** - Alert messages
- **Badge** - Status indicators
- **ProgressBar** - Progress visualization
- **Modal** - Dialog component
- **LoadingSpinner** - Loading indicator

### Context Providers (2)
- **AuthContext** - Authentication state
- **NotificationContext** - Toast notifications

### Custom Hooks (2)
- **useAuth()** - Auth state and methods
- **useFetch()** - API data fetching

### Services (5)
- **authService** - Login, register, logout
- **courseService** - Get courses, search, rate
- **enrollmentService** - Enroll, track progress
- **quizService** - Get quizzes, submit answers
- **userService** - Profile, stats, certificates

## Features

✅ **Authentication**
- Login/Register pages with validation
- Protected routes with auto-redirect
- Token management and persistence

✅ **Navigation**
- Header with user menu dropdown
- Footer with links
- React Router v6 integration

✅ **State Management**
- Context API for auth state
- Custom hooks for clean API access
- Automatic token injection

✅ **Forms & Validation**
- Email validation
- Password strength checking
- Form error display

✅ **UI/UX**
- Tailwind CSS styling
- Responsive design
- Loading states
- Alert/error messages
- Progress indicators

✅ **API Integration**
- Axios instance with interceptors
- Bearer token support
- Error handling
- 401 automatic redirect

## Routes

```
/                 - Home page
/login           - Login page
/register        - Registration page
/dashboard       - User dashboard (protected)
/courses         - Browse courses
*                - Redirect to home
```

## API Service Usage

```javascript
// Authentication
import authService from './services/authService';
await authService.login(email, password);
await authService.register(name, email, password);
authService.logout();

// Courses
import courseService from './services/courseService';
const courses = await courseService.getAllCourses();
const course = await courseService.getCourseById(courseId);

// Enrollments
import enrollmentService from './services/enrollmentService';
await enrollmentService.enrollCourse(courseId);
const enrollments = await enrollmentService.getUserEnrollments();

// Users
import userService from './services/userService';
const profile = await userService.getProfile();
await userService.updateProfile(data);

// Quizzes
import quizService from './services/quizService';
const quiz = await quizService.getQuiz(quizId);
await quizService.submitQuiz(quizId, answers);
```

## Hook Usage

```javascript
// Get authentication state
const { user, isAuthenticated, login, register, logout, error } = useAuth();

// Fetch data
const { data, loading, error } = useFetch('/courses');
```

## Component Examples

```jsx
// Button
<Button variant="primary" size="lg" fullWidth onClick={handleClick}>
  Submit
</Button>

// Input
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>

// Card with hover effect
<Card hoverable onClick={() => navigate('/course')}>
  <h3>Course Title</h3>
  <p>Description here</p>
</Card>

// Alert
<Alert message="Success!" type="success" dismissible onClose={handleClose} />

// Progress bar
<ProgressBar progress={65} label="Progress" showPercentage />

// Modal
<Modal isOpen={isOpen} onClose={handleClose} title="Modal">
  <p>Modal content</p>
</Modal>
```

## Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AIEduAssist
VITE_APP_VERSION=1.0.0
```

## File Statistics

**Total Files**: 31+
- Pages: 5
- Components: 11
- Services: 5
- Contexts: 2
- Hooks: 2
- Utils: 3
- Layouts: 2
- Config: 4

**Lines of Code**: ~2,500+ lines

## Week 1 Development Summary

✅ Project initialization with Vite
✅ Tailwind CSS configuration
✅ All core components built
✅ Authentication pages
✅ API service layer
✅ Context providers
✅ Custom hooks
✅ Routing setup
✅ Protected routes
✅ Error handling

## Next Week (Week 2) Priorities

- [ ] Course detail page with enrollment
- [ ] Quiz interface and submission
- [ ] User profile page
- [ ] Certification test page
- [ ] Search & filter optimization
- [ ] Error boundary implementation
- [ ] Loading skeleton screens
- [ ] Mobile responsiveness polish

## Troubleshooting

**CORS Error**: Ensure backend is running on port 5000
**Token not persisting**: Check localStorage is enabled
**Styles not applying**: Clear cache with `npm run build`

## Development Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios](https://axios-http.com)
- [React Router](https://reactrouter.com)

---

**Status**: ✅ Week 1 Complete
**Version**: 1.0.0  
**Last Updated**: April 2026
