import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ContentGeneratorService {
  async generateOutline(courseId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/content/generate/outline/${courseId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate outline');
    }
  }

  async generateProblems(courseId, difficulty = 'mixed', count = 10) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/content/generate/problems/${courseId}`,
        { difficulty, count }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate problems');
    }
  }

  async generateFlashcards(courseId, topicFilter = null) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/content/generate/flashcards/${courseId}`,
        { topicFilter }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate flashcards');
    }
  }

  async generateSummary(courseId, length = 'medium') {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/content/generate/summary/${courseId}`,
        { length }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate summary');
    }
  }

  async getGeneratedContent(courseId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/content/generated/${courseId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get generated content');
    }
  }

  async getOutline(courseId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/content/outline/${courseId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get outline');
    }
  }

  async getProblems(contentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/content/problems/${contentId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get problems');
    }
  }

  async getFlashcards(setId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/content/flashcards/${setId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get flashcards');
    }
  }

  async deleteGeneratedContent(contentId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/content/generated/${contentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete content');
    }
  }

  async exportContent(contentId, format = 'pdf') {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/content/generated/${contentId}/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to export content');
    }
  }
}

export default new ContentGeneratorService();
