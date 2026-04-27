import axiosInstance from '../utils/axios';

const notificationService = {
  // Notifications
  getNotifications: (params = {}) =>
    axiosInstance.get('/notifications', { params }),

  getUnreadCount: () =>
    axiosInstance.get('/notifications/unread/count'),

  getNotificationsByType: (type) =>
    axiosInstance.get('/notifications', { params: { type } }),

  getNotificationsByPriority: (priority) =>
    axiosInstance.get(`/notifications/priority/${priority}`),

  markAsRead: (notificationId) =>
    axiosInstance.put(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    axiosInstance.put('/notifications/all/read'),

  deleteNotification: (notificationId) =>
    axiosInstance.delete(`/notifications/${notificationId}`),

  deleteAllNotifications: () =>
    axiosInstance.delete('/notifications'),

  // Preferences
  getPreferences: () =>
    axiosInstance.get('/preferences'),

  updatePreferences: (preferencesData) =>
    axiosInstance.put('/preferences', preferencesData),

  toggleEmailNotifications: (enabled) =>
    axiosInstance.put('/preferences/email/toggle', { enabled }),

  togglePushNotifications: (enabled) =>
    axiosInstance.put('/preferences/push/toggle', { enabled }),

  toggleInAppNotifications: (enabled) =>
    axiosInstance.put('/preferences/inapp/toggle', { enabled }),

  setQuietHours: (quietHours) =>
    axiosInstance.put('/preferences/quiet-hours', quietHours),

  enableNotificationSummary: () =>
    axiosInstance.post('/preferences/summary/enable'),

  disableNotificationSummary: () =>
    axiosInstance.post('/preferences/summary/disable'),

  resetPreferences: () =>
    axiosInstance.post('/preferences/reset'),
};

export default notificationService;
