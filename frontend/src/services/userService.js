import axiosInstance from '../utils/axios';

const userService = {
  getProfile: () =>
    axiosInstance.get('/users/profile'),

  updateProfile: (profileData) =>
    axiosInstance.put('/users/profile', profileData),

  getUserById: (userId) =>
    axiosInstance.get(`/users/${userId}`),

  changePassword: (currentPassword, newPassword) =>
    axiosInstance.post('/users/change-password', {
      currentPassword,
      newPassword,
    }),

  getUserStats: () =>
    axiosInstance.get('/users/stats'),

  getCertifications: () =>
    axiosInstance.get('/users/certifications'),
};

export default userService;
