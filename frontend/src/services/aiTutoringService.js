import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AITutoringService {
  async startConversation(courseId, title = null) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/conversations`, {
        courseId,
        title
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to start conversation');
    }
  }

  async getConversation(conversationId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/ai/conversations/${conversationId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get conversation');
    }
  }

  async getUserConversations(courseId = null, limit = 20) {
    try {
      let url = `${API_BASE_URL}/ai/conversations?limit=${limit}`;
      if (courseId) {
        url += `&courseId=${courseId}`;
      }
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get conversations');
    }
  }

  async sendMessage(conversationId, message) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/conversations/${conversationId}/message`,
        { message }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  }

  async deleteConversation(conversationId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/ai/conversations/${conversationId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete conversation');
    }
  }

  async generateStudyGuide(courseId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/study-guides/${courseId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate study guide');
    }
  }

  async generateHint(questionId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/hints/${questionId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate hint');
    }
  }
}

export default new AITutoringService();
