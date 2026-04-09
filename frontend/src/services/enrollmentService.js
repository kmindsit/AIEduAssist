import axiosInstance from '../utils/axios';

const enrollmentService = {
  enrollCourse: (courseId) =>
    axiosInstance.post('/enrollments', { courseId }),

  getUserEnrollments: (params = {}) =>
    axiosInstance.get('/enrollments', { params }),

  getEnrollmentDetails: (courseId) =>
    axiosInstance.get(`/enrollments/${courseId}`),

  updateProgress: (courseId, progress) =>
    axiosInstance.put(`/enrollments/${courseId}`, { progress }),

  markContentComplete: (courseId, contentId) =>
    axiosInstance.post(`/enrollments/${courseId}/complete`, { contentId }),

  unenrollCourse: (courseId) =>
    axiosInstance.delete(`/enrollments/${courseId}`),
};

export default enrollmentService;
