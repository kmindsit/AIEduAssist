# Frontend - AIEduAssist

Frontend application for the AIEduAssist platform.

## Technology Stack
- **Framework**: React (version 18+)
- **Build Tool**: Vite / Create React App
- **State Management**: Context API / Redux (TBD)
- **Styling**: Tailwind CSS / CSS Modules
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── styles/         # Global and component styles
│   ├── utils/          # Utility functions
│   ├── context/        # Context API providers
│   ├── hooks/          # Custom React hooks
│   ├── App.jsx         # Main app component
│   └── index.jsx       # Entry point
├── public/             # Static assets
├── package.json        # Dependencies
├── .env.example        # Environment template
├── vite.config.js      # Vite configuration
└── README.md
```

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in your environment variables
# - API base URL
# - Other configuration
```

## Running the Application

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Required variables in `.env`:
- `VITE_API_URL` - Backend API base URL (e.g., http://localhost:5000/api)
- `VITE_APP_NAME` - Application name

See `.env.example` for all available variables.

## Project Pages

### User Pages
- **Login Page** - User authentication
- **Register Page** - User registration
- **Dashboard** - User's learning dashboard
- **Courses Page** - Browse and search courses
- **Course Detail Page** - View course information and enroll
- **Content Page** - Access course learning materials
- **Quiz Page** - Take quizzes and assessments
- **Certification Page** - Complete certification tests
- **Profile Page** - User settings and progress

### Admin Pages
- **Admin Dashboard** - Overview and analytics
- **User Management** - View and manage users
- **Course Management** - Create and edit courses
- **Content Management** - Manage course content
- **Quiz Management** - Create and manage quizzes

## Key Components

### Layout Components
- Navigation / Header
- Sidebar / Menu
- Footer

### Reusable Components
- Button
- Card
- Form / Input
- Modal / Dialog
- Progress Bar
- Loading Spinner
- Alert / Toast

### Feature Components
- Course Card
- Question Card
- Quiz Interface
- Certificate Display

## Styling

Using Tailwind CSS for styling. Key directories:
- `src/styles/globals.css` - Global styles
- `src/styles/variables.css` - CSS variables (colors, fonts)
- Component-level Tailwind classes

## State Management

### Context Providers
- **AuthContext** - User authentication state
- **CourseContext** - Course data and state
- **UserContext** - User profile and preferences
- **UIContext** - UI state (modals, notifications)

### Custom Hooks
- `useAuth()` - Authentication operations
- `useCourse()` - Course operations
- `useFetch()` - API data fetching
- `useNotification()` - Notification display

## API Integration

### Axios Setup
- Base URL configuration
- Request/response interceptors
- Automatic token attachment
- Error handling

### API Services
- `authService.js` - Authentication APIs
- `courseService.js` - Course APIs
- `userService.js` - User APIs
- `quizService.js` - Quiz APIs

## Development Notes

- Use functional components with hooks
- Follow component composition patterns
- Keep components reusable and focused
- Implement proper error boundaries
- Use loading and error states
- Add accessibility features (ARIA labels, etc.)
- Follow mobile-first design approach

## Dependencies

Key packages:
```json
{
  "react": "UI library",
  "react-dom": "React DOM",
  "react-router-dom": "Client-side routing",
  "axios": "HTTP client",
  "tailwindcss": "CSS framework",
  "vite": "Build tool"
}
```

## Building for Production

```bash
# Create optimized build
npm run build

# Output in dist/ directory
```

## Deployment

[TBD - Add deployment instructions]

## Contributors
- Frontend Developer

## Support
For issues, contact the development team.
