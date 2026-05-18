import axiosInstance from '../utils/axios';

const analyticsService = {
  // User Analytics
  getUserAnalytics: () =>
    axiosInstance.get('/users/analytics'),

  getLearningPath: () =>
    axiosInstance.get('/users/analytics/learning-path'),

  getCourseProgress: () =>
    axiosInstance.get('/users/analytics/course-progress'),

  getQuizPerformance: () =>
    axiosInstance.get('/users/analytics/quiz-performance'),

  getEnrollmentTrends: () =>
    axiosInstance.get('/users/analytics/enrollment-trends'),

  getTimeSpentAnalytics: () =>
    axiosInstance.get('/users/analytics/time-spent'),

  getSkillsGained: () =>
    axiosInstance.get('/users/analytics/skills'),

  getCertificateProgress: () =>
    axiosInstance.get('/users/analytics/certificates'),

  getStudyStreaks: () =>
    axiosInstance.get('/users/analytics/streaks'),

  // Course Analytics
  getCourseAnalytics: (courseId) =>
    axiosInstance.get(`/courses/${courseId}/analytics`),

  // Recommendations
  getRecommendations: () =>
    axiosInstance.get('/users/recommendations'),

  getNextCourses: () =>
    axiosInstance.get('/users/recommendations/next-courses'),

  getWeakAreasToStudy: () =>
    axiosInstance.get('/users/recommendations/weak-areas'),
};

export default analyticsService;
