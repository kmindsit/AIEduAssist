import axios from '../utils/axios';

const quizResultsService = {
  async getQuizResults(quizId) {
    const response = await axios.get(`/api/quizzes/${quizId}`);
    return response.data.data;
  },

  async submitQuizAnswers(quizId, answers, timeSpent = 0) {
    const response = await axios.post(`/api/quizzes/${quizId}/submit`, {
      answers,
      time_spent: timeSpent
    });
    return response.data.data;
  },

  async getScoreBreakdown(quizId, attemptId) {
    const response = await axios.get(`/api/quizzes/${quizId}/attempts`);
    const attempts = response.data.data;
    return attempts.find(a => a.id === attemptId) || null;
  },

  async retakeQuiz(quizId) {
    const response = await axios.get(`/api/quizzes/${quizId}`);
    return response.data.data;
  },

  async getQuizAttempts(quizId) {
    const response = await axios.get(`/api/quizzes/${quizId}/attempts`);
    return response.data.data;
  },

  async getLatestAttempt(quizId) {
    const response = await axios.get(`/api/quizzes/${quizId}/latest`);
    return response.data.data;
  }
};

export default quizResultsService;
