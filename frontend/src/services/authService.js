import axiosInstance from '../utils/axios';

const authService = {
  register: (name, email, password) =>
    axiosInstance.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  refreshToken: (refreshToken) =>
    axiosInstance.post('/auth/refresh', { refreshToken }),

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setToken: (token, refreshToken) => {
    localStorage.setItem('authToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },

  getToken: () => localStorage.getItem('authToken'),
};

export default authService;
