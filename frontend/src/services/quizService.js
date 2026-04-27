import axiosInstance from '../utils/axios';

const quizService = {
  getQuiz: (quizId) =>
    axiosInstance.get(`/quizzes/${quizId}`),

  submitQuiz: (submissionData) =>
    axiosInstance.post(`/quizzes/submit`, submissionData),

  getCourseQuizzes: (courseId) =>
    axiosInstance.get(`/courses/${courseId}/quizzes`),

  getQuizSubmissions: (quizId) =>
    axiosInstance.get(`/quizzes/${quizId}/submissions`),

  createQuiz: (courseId, quizData) =>
    axiosInstance.post(`/courses/${courseId}/quizzes`, quizData),

  updateQuiz: (quizId, quizData) =>
    axiosInstance.put(`/quizzes/${quizId}`, quizData),

  deleteQuiz: (quizId) =>
    axiosInstance.delete(`/quizzes/${quizId}`),

  getCourseCertification: (courseId) =>
    axiosInstance.get(`/courses/${courseId}/certification`),

  submitCertification: (submissionData) =>
    axiosInstance.post(`/certificates/submit`, submissionData),
};

export default quizService;
