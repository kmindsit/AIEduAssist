import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AdminService {
  async getAnalyticsOverview() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/analytics/overview`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get analytics overview');
    }
  }

  async getUserAnalytics(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/analytics/users`, {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get user analytics');
    }
  }

  async getCourseAnalytics(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/analytics/courses`, {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get course analytics');
    }
  }

  async getLearningOutcomes(filters = {}) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/analytics/learning-outcomes`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get learning outcomes');
    }
  }

  async getEngagementMetrics(filters = {}) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/analytics/engagement`,
        { params: filters }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get engagement metrics');
    }
  }

  async getCourseReport(courseId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/reports/course-report/${courseId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get course report');
    }
  }

  async getUserReport(userId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/reports/user-report/${userId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get user report');
    }
  }

  async getAllUsers(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get users');
    }
  }

  async updateUser(userId, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  }

  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  }

  async exportAnalyticsReport(format = 'pdf') {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/analytics/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to export report');
    }
  }

  async getSystemHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/health`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get system health');
    }
  }
}

export default new AdminService();
