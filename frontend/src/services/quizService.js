import axiosInstance from '../utils/axios';

const quizService = {
  getQuiz: (quizId) =>
    axiosInstance.get(`/quizzes/${quizId}`),

  submitQuiz: (quizId, answers) =>
    axiosInstance.post(`/quizzes/${quizId}/submit`, { answers }),

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
};

export default quizService;
