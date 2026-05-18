import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import QuizPage from './pages/QuizPage';
import CertificationPage from './pages/CertificationPage';
import DiscussionPage from './pages/DiscussionPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import NotificationPreferencesPage from './pages/NotificationPreferencesPage';
import CertificateManagementPage from './pages/CertificateManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Styles
import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />
            <Route
              path="/login"
              element={
                <MainLayout>
                  <LoginPage />
                </MainLayout>
              }
            />
            <Route
              path="/register"
              element={
                <MainLayout>
                  <RegisterPage />
                </MainLayout>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <MainLayout>
                  <CoursesPage />
                </MainLayout>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <MainLayout>
                  <CourseDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <QuizPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/certification/:courseId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CertificationPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/discussions"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DiscussionPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <NotificationCenterPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications/preferences"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <NotificationPreferencesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CertificateManagementPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AnalyticsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
