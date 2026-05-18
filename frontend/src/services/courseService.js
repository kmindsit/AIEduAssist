import axiosInstance from '../utils/axios';

const courseService = {
  getAllCourses: (params = {}) =>
    axiosInstance.get('/courses', { params }),

  getCourseById: (courseId) =>
    axiosInstance.get(`/courses/${courseId}`),

  searchCourses: (query) =>
    axiosInstance.get('/courses', { params: { search: query } }),

  getCoursesByCategory: (category) =>
    axiosInstance.get('/courses', { params: { category } }),

  createCourse: (courseData) =>
    axiosInstance.post('/courses', courseData),

  updateCourse: (courseId, courseData) =>
    axiosInstance.put(`/courses/${courseId}`, courseData),

  deleteCourse: (courseId) =>
    axiosInstance.delete(`/courses/${courseId}`),

  getCourseContent: (courseId) =>
    axiosInstance.get(`/courses/${courseId}/content`),

  rateCourse: (courseId, ratingData) =>
    axiosInstance.post(`/courses/${courseId}/rate`, ratingData),
};

export default courseService;
