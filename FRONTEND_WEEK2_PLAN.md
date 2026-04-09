# Frontend Week 2 Implementation Plan

## Overview
This document outlines the features to be implemented in Week 2 to complete the core education platform functionality.

**Estimated Time**: 40 hours
**Priority**: HIGH for platform functionality

## Week 2 Deliverables

### 1. Course Detail Page (8 hours)
**File**: `src/pages/CourseDetailPage.jsx`

```jsx
// Features:
- Display course full details (title, description, instructor, rating)
- Course content preview
- Enrollment button
- Enrolled student count
- Course reviews/ratings section
- Related courses carousel
- Purchase/Enroll flow with confirmation modal
```

**Components Needed**:
- `CourseHero.jsx` - Course banner with image
- `CourseInfo.jsx` - Course metadata
- `InstructorCard.jsx` - Instructor details
- `ReviewSection.jsx` - Display reviews
- `EnrollmentModal.jsx` - Enrollment dialog

**API Calls**:
- `courseService.getCourseById(courseId)`
- `enrollmentService.enrollCourse(courseId)`
- `courseService.rateCourse(courseId, rating)`

---

### 2. Quiz Interface (10 hours)
**File**: `src/pages/QuizPage.jsx`

```jsx
// Features:
- Display quiz questions one at a time
- Multiple choice options
- Show/hide explanations
- Timer for timed quizzes
- Progress indicator
- Submit button with confirmation
- Show results after submission
- Score display with pass/fail status
```

**Components Needed**:
- `QuestionCard.jsx` - Single question display
- `QuizTimer.jsx` - Countdown timer
- `QuizResults.jsx` - Results display
- `AnswerOptionButton.jsx` - Interactive options

**API Calls**:
- `quizService.getQuiz(quizId)`
- `quizService.submitQuiz(quizId, answers)`
- `enrollmentService.markContentComplete(courseId, contentId)`

**Logic**:
```javascript
// Quiz flow:
1. Load quiz questions
2. Display first question
3. User selects answer
4. Move to next on confirmation
5. Submit all answers
6. Calculate score
7. Show results with certificate option
```

---

### 3. User Profile Page (6 hours)
**File**: `src/pages/ProfilePage.jsx`

```jsx
// Features:
- Display user information (name, email, bio, avatar)
- Edit profile form with validation
- Change password form
- Profile picture upload
- Account settings
- Delete account option
- Statistics dashboard (courses, certificates, etc.)
```

**Components Needed**:
- `ProfileHeader.jsx` - User info and avatar
- `ProfileEdit.jsx` - Edit form
- `ChangePassword.jsx` - Password change
- `AccountSettings.jsx` - Settings options
- `Statistics.jsx` - User stats

**API Calls**:
- `userService.getProfile()`
- `userService.updateProfile(data)`
- `userService.changePassword(old, new)`
- `userService.getUserStats()`

---

### 4. Certification Test Page (8 hours)
**File**: `src/pages/CertificationPage.jsx`

```jsx
// Features:
- Full certification exam interface
- Strict time limit
- Multiple quiz sections
- Question review before submission
- Final confirmation before submit
- Certificate generation on pass
- Download certificate as PDF
- View all certificates in profile
```

**Components Needed**:
- `CertificationQuiz.jsx` - Main quiz interface
- `ExamTimer.jsx` - Strict timer with warnings
- `QuestionReview.jsx` - Review all questions
- `CertificateDisplay.jsx` - Certificate view/download

**API Calls**:
- `quizService.getCourseQuizzes(courseId)`
- `quizService.submitQuiz(quizId, answers)`
- `userService.getCertifications()`

---

### 5. Search & Filter Optimization (4 hours)
**File**: Enhance `src/pages/CoursesPage.jsx`

```jsx
// Features:
- Advanced search with debounce
- Multiple filter options (level, category, rating, price)
- Sort options (newest, popular, rating, duration)
- Save filter preferences
- Show filter count badge
- Clear all filters button
- Search history
```

**Enhancements**:
- Add debounce to search input (300ms)
- Implement filter persistence in localStorage
- Add search suggestions/autocomplete

**Components Needed**:
- `AdvancedFilters.jsx` - Filter UI
- `SortSelector.jsx` - Sort options
- `SearchSuggestions.jsx` - Search hints

---

### 6. Error Boundary (2 hours)
**File**: `src/components/ErrorBoundary.jsx`

```jsx
// Features:
- Catch React errors
- Display user-friendly error message
- Retry button to recover
- Log errors to console
- Report error details
```

**Wrap App with ErrorBoundary**:
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### 7. Skeleton Loading Screens (2 hours)
**Files**: Create `src/components/Skeletons/`

```jsx
// Components:
- CourseSkeleton.jsx
- PageSkeleton.jsx
- CardSkeleton.jsx
- ProgressSkeleton.jsx
```

**Usage**:
```jsx
// Before: <CourseCard course={course} />
// After:
{loading ? <CourseSkeleton /> : <CourseCard course={course} />}
```

---

## Implementation Priority

### MUST HAVE (Weeks 2)
1. ✅ Course Detail Page
2. ✅ Quiz Interface
3. ✅ Certification Page

### SHOULD HAVE (Weeks 2)
4. ✅ User Profile Page
5. ✅ Error Boundary

### NICE TO HAVE (Week 2 if time)
6. ✅ Search Optimization
7. ✅ Skeleton Loaders

## Testing Checklist

- [ ] All forms validate correctly
- [ ] API calls work with backend
- [ ] Error states display properly
- [ ] Loading states show spinners
- [ ] Protected routes redirect correctly
- [ ] Responsive on mobile/tablet
- [ ] Forms clear after submission
- [ ] No console errors

## Code Structure Example

```javascript
// New file structure after Week 2:
src/pages/
├── HomePage.jsx
├── LoginPage.jsx
├── RegisterPage.jsx
├── CoursesPage.jsx
├── CourseDetailPage.jsx       // NEW
├── DashboardPage.jsx
├── ProfilePage.jsx            // NEW
├── QuizPage.jsx               // NEW
└── CertificationPage.jsx      // NEW

src/components/
├── Skeletons/                 // NEW
│   ├── CourseSkeleton.jsx
│   ├── CardSkeleton.jsx
│   └── PageSkeleton.jsx
├── ErrorBoundary.jsx          // NEW
├── CourseHero.jsx             // NEW
├── QuestionCard.jsx           // NEW
├── CertificateDisplay.jsx     // NEW
└── ... (existing components)
```

## Database/API Notes

The backend already has all necessary endpoints. Frontend just needs to call them:

- ✅ `GET /courses/:id` - Get course details
- ✅ `POST /enrollments` - Enroll in course
- ✅ `GET /quizzes/:id` - Get quiz
- ✅ `POST /quizzes/:id/submit` - Submit answers
- ✅ `GET /users/profile` - Get user profile
- ✅ `PUT /users/profile` - Update profile
- ✅ `GET /users/certifications` - Get certificates

## Performance Optimization

- Add React.memo for course cards
- Use useCallback for event handlers
- Implement code splitting for pages (lazy load)
- Cache API responses where applicable
- Debounce search input
- Optimize image loading

```javascript
// Example: Lazy load pages
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const CertificationPage = React.lazy(() => import('./pages/CertificationPage'));

<Suspense fallback={<LoadingSpinner />}>
  <CoursesPage />
</Suspense>
```

## Styling Consistency

All new components should:
- Use existing color scheme (blue/green)
- Follow component variant patterns
- Use Tailwind spacing (4px increments)
- Support dark mode (optional for Week 2)
- Be mobile responsive

## File Size Estimates

After Week 2:
- Total source files: ~50+
- Lines of code: ~4,500+
- Build size: ~150KB (gzipped ~40KB)

## Success Criteria

✅ All 5 new pages functional
✅ Quiz submission working
✅ Certificate generation
✅ 95% UI/UX complete
✅ No console errors
✅ Mobile responsive
✅ All API endpoints working
✅ Form validation complete

## Known Limitations / Future Work

- Admin dashboard (Week 3)
- Advanced analytics (Week 3)
- Real-time notifications (Week 4)
- Video player integration (Week 4)
- Offline support (Future)

---

**Week 2 Target**: Complete all MUST HAVE items + User Profile
**Time Allocation**: ~40 hours of solid development

Start with Course Detail Page for quick wins! 🚀
