import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import notificationService from '../services/notificationService';
import Button from '../components/Button';
import Card from '../components/Card';
import Toggle from '../components/Toggle';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const NotificationPreferencesPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(null);

  const notificationTypes = [
    { key: 'enrollment', label: 'Course Enrollment', icon: '📝' },
    { key: 'course_completed', label: 'Course Completion', icon: '✅' },
    { key: 'certificate_awarded', label: 'Certificate Award', icon: '🏆' },
    { key: 'quiz_passed', label: 'Quiz Passed', icon: '🎯' },
    { key: 'quiz_failed', label: 'Quiz Failed', icon: '❌' },
    { key: 'discussion_reply', label: 'Discussion Replies', icon: '💬' },
    { key: 'instructor_message', label: 'Instructor Messages', icon: '👨‍🏫' },
    { key: 'system_updates', label: 'System Updates', icon: '⚙️' },
    { key: 'course_update', label: 'Course Updates', icon: '📚' },
    { key: 'assignment_deadline', label: 'Assignment Deadlines', icon: '⏰' },
    { key: 'grade_posted', label: 'Grade Posted', icon: '📊' },
    { key: 'new_content', label: 'New Content', icon: '🎁' },
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error) {
      showNotification('Failed to load preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = async (channel, enabled) => {
    try {
      setSaving(true);
      const channelMap = {
        email: 'toggleEmailNotifications',
        push: 'togglePushNotifications',
        inApp: 'toggleInAppNotifications',
      };

      await notificationService[channelMap[channel]](enabled);
      setPreferences({
        ...preferences,
        channels: {
          ...preferences.channels,
          [channel]: enabled,
        },
      });
      showNotification(
        `${channel} notifications ${enabled ? 'enabled' : 'disabled'}`,
        'success'
      );
    } catch (error) {
      showNotification('Failed to update setting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationTypeToggle = async (type, enabled) => {
    try {
      setSaving(true);
      const updated = {
        ...preferences,
        notificationTypes: {
          ...preferences.notificationTypes,
          [type]: enabled,
        },
      };
      await notificationService.updatePreferences(updated);
      setPreferences(updated);
      showNotification('Preference updated', 'success');
    } catch (error) {
      showNotification('Failed to update preference', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = async (type, frequency) => {
    try {
      setSaving(true);
      const updated = {
        ...preferences,
        notificationFrequency: {
          ...preferences.notificationFrequency,
          [type]: frequency,
        },
      };
      await notificationService.updatePreferences(updated);
      setPreferences(updated);
      showNotification('Frequency updated', 'success');
    } catch (error) {
      showNotification('Failed to update frequency', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuietHoursChange = async (start, end) => {
    try {
      setSaving(true);
      const updated = {
        ...preferences,
        quietHours: {
          start,
          end,
          enabled: true,
        },
      };
      await notificationService.setQuietHours(updated.quietHours);
      setPreferences(updated);
      showNotification('Quiet hours updated', 'success');
    } catch (error) {
      showNotification('Failed to update quiet hours', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPreferences = async () => {
    if (!window.confirm('Reset all preferences to defaults?')) {
      return;
    }

    try {
      setSaving(true);
      await notificationService.resetPreferences();
      fetchPreferences();
      showNotification('Preferences reset to defaults', 'success');
    } catch (error) {
      showNotification('Failed to reset preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!preferences) return <Alert type="error" message="Failed to load preferences" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Notification Preferences
          </h1>
          <p className="text-gray-600">
            Customize how and when you receive notifications
          </p>
        </div>

        {/* Notification Channels */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Communication Channels</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">📧 Email Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive important updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels?.email || false}
                  onChange={(e) => handleChannelToggle('email', e.target.checked)}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">🔔 Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  Get instant alerts on your device
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels?.push || false}
                  onChange={(e) => handleChannelToggle('push', e.target.checked)}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">💬 In-App Notifications</h3>
                <p className="text-sm text-gray-600">
                  See notifications in the app
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels?.inApp || false}
                  onChange={(e) => handleChannelToggle('inApp', e.target.checked)}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Notification Types */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Notification Types</h2>
          <p className="text-gray-600 mb-6">
            Choose which types of notifications you want to receive
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {type.label}
                  </span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      preferences.notificationTypes?.[type.key] !== false
                    }
                    onChange={(e) =>
                      handleNotificationTypeToggle(type.key, e.target.checked)
                    }
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Quiet Hours */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quiet Hours</h2>
          <p className="text-gray-600 mb-6">
            Set a time window when you don't want to receive notifications
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quietHours?.start || '22:00'}
                onChange={(e) =>
                  handleQuietHoursChange(
                    e.target.value,
                    preferences.quietHours?.end || '06:00'
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={preferences.quietHours?.end || '06:00'}
                onChange={(e) =>
                  handleQuietHoursChange(
                    preferences.quietHours?.start || '22:00',
                    e.target.value
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Alert
              type="info"
              message="Notifications during quiet hours will be queued and delivered after the quiet hours end."
            />
          </div>
        </Card>

        {/* Notification Frequency */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Notification Frequency</h2>
          <p className="text-gray-600 mb-6">
            Choose how often you want to receive notifications
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                📧 Email Digest Frequency
              </label>
              <select
                value={preferences.notificationFrequency?.email || 'immediate'}
                onChange={(e) =>
                  handleFrequencyChange('email', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Summary Preferences */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Email Summary</h2>
          <p className="text-gray-600 mb-4">
            Get a weekly summary of your learning activity
          </p>
          <div className="flex items-center justify-between">
            <span className="font-medium">Enable Weekly Summary Email</span>
            <Button
              onClick={() =>
                preferences.summaryEmailEnabled
                  ? notificationService.disableNotificationSummary()
                  : notificationService.enableNotificationSummary()
              }
              variant="primary"
            >
              {preferences.summaryEmailEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/notifications')}
            variant="outline"
            fullWidth
          >
            Back to Notifications
          </Button>
          <Button
            onClick={handleResetPreferences}
            variant="danger"
            fullWidth
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
