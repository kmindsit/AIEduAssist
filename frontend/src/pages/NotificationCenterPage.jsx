import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import notificationService from '../services/notificationService';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const NotificationCenterPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('unread');
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationTypes = [
    { value: 'enrollment_confirmed', label: 'Enrollment', icon: '📝' },
    { value: 'course_completed', label: 'Completion', icon: '✅' },
    { value: 'certificate_awarded', label: 'Certificate', icon: '🏆' },
    { value: 'quiz_passed', label: 'Quiz Passed', icon: '🎯' },
    { value: 'quiz_failed', label: 'Quiz Failed', icon: '❌' },
    { value: 'discussion_reply', label: 'Discussion Reply', icon: '💬' },
    { value: 'instructor_message', label: 'Instructor', icon: '👨‍🏫' },
    { value: 'system', label: 'System', icon: '⚙️' },
  ];

  const priorityColors = {
    low: 'gray',
    normal: 'blue',
    high: 'orange',
    urgent: 'red',
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        isRead: filterRead === 'all' ? undefined : filterRead === 'unread' ? false : true,
      };
      const data = await notificationService.getNotifications(params);
      setNotifications(data);
    } catch (error) {
      showNotification('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
      showNotification('Marked as read', 'success');
    } catch (error) {
      showNotification('Failed to mark as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
      showNotification('All marked as read', 'success');
    } catch (error) {
      showNotification('Failed to mark all as read', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications();
      showNotification('Notification deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete notification', 'error');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    try {
      await notificationService.deleteAllNotifications();
      fetchNotifications();
      showNotification('All notifications deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete notifications', 'error');
    }
  };

  const getTypeIcon = (type) => {
    const notifType = notificationTypes.find((t) => t.value === type);
    return notifType?.icon || '📬';
  };

  const filteredNotifications = notifications
    .filter((n) => filterType === 'all' || n.type === filterType)
    .filter((n) => {
      if (filterRead === 'all') return true;
      return filterRead === 'unread' ? !n.isRead : n.isRead;
    });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg text-gray-600">
                You have <strong>{unreadCount}</strong> unread notification
                {unreadCount !== 1 ? 's' : ''}
              </span>
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                size="sm"
              >
                Mark All as Read
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Left: Filters */}
          <Card className="h-fit sticky top-20">
            <h3 className="font-bold text-lg mb-4">Filters</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Type</h4>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Status</h4>
                <div className="space-y-2">
                  {['all', 'unread', 'read'].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="read-status"
                        value={status}
                        checked={filterRead === status}
                        onChange={(e) => setFilterRead(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleDeleteAll}
                variant="danger"
                fullWidth
                size="sm"
              >
                Delete All
              </Button>
            </div>
          </Card>

          {/* Right: Notifications List */}
          <div className="col-span-3">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notif) => (
                  <Card
                    key={notif._id}
                    className={`flex gap-4 transition ${
                      !notif.isRead
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl flex-shrink-0 mt-1">
                      {getTypeIcon(notif.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-semibold text-gray-900 ${!notif.isRead ? 'text-lg' : ''}`}>
                            {notif.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notif.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant={
                              notif.priority === 'urgent'
                                ? 'danger'
                                : notif.priority === 'high'
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {notif.priority}
                          </Badge>
                          {!notif.isRead && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>

                      <div className="flex gap-2">
                        {!notif.isRead && (
                          <Button
                            onClick={() => handleMarkAsRead(notif._id)}
                            variant="outline"
                            size="sm"
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteNotification(notif._id)}
                          variant="outline"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 text-lg">No notifications</p>
                <p className="text-gray-500 text-sm mt-2">
                  You're all caught up! Come back later for updates.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <h3 className="font-bold text-lg mb-4">Notification Settings</h3>
          <p className="text-gray-600 mb-4">
            Manage your notification preferences
          </p>
          <Button
            onClick={() => navigate('/notifications/preferences')}
            variant="primary"
          >
            Go to Preferences →
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default NotificationCenterPage;
