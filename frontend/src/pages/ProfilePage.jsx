import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import userService from '../services/userService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfile();
      const statsData = await userService.getUserStats();

      setProfile(profileData);
      setStats(statsData);

      // Initialize form with profile data
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        avatar: profileData.avatar || '',
      });
    } catch (error) {
      showNotification('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Invalid email format';
    }
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const newErrors = validateProfileForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await userService.updateProfile(formData);
      showNotification('Profile updated successfully!', 'success');
      fetchProfileData();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to update profile',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newErrors = validatePasswordForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showNotification('Password changed successfully!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to change password',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      await userService.deleteAccount();
      showNotification('Account deleted successfully', 'success');
      logout();
      navigate('/');
    } catch (error) {
      showNotification('Failed to delete account', 'error');
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <Alert type="error" message="Failed to load profile" />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600 mt-2">{profile.email}</p>
                <Badge variant="primary" className="mt-3">
                  {profile.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.enrolledCourses || 0}</p>
              <p className="text-gray-600 text-sm">Enrolled Courses</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats.completedCourses || 0}
              </p>
              <p className="text-gray-600 text-sm">Completed Courses</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {stats.certificatesEarned || 0}
              </p>
              <p className="text-gray-600 text-sm">Certificates</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {stats.quizzesPassed || 0}
              </p>
              <p className="text-gray-600 text-sm">Quizzes Passed</p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {['profile', 'security', 'courses', 'certificates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                error={errors.name}
                required
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                error={errors.email}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="5"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => fetchProfileData()}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card>
            <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                error={errors.currentPassword}
                required
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                error={errors.newPassword}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                error={errors.confirmPassword}
                required
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                  }
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  Change Password
                </Button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="danger"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <Card>
            <h2 className="text-2xl font-bold mb-6">My Courses</h2>
            {stats?.enrolledCourses > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have enrolled in {stats.enrolledCourses} course
                  {stats.enrolledCourses !== 1 ? 's' : ''}
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="primary"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
                <Button
                  onClick={() => navigate('/courses')}
                  variant="primary"
                >
                  Browse Courses
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <Card>
            <h2 className="text-2xl font-bold mb-6">My Certificates</h2>
            {stats?.certificatesEarned > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have earned {stats.certificatesEarned} certificate
                  {stats.certificatesEarned !== 1 ? 's' : ''}
                </p>
                <Alert
                  type="info"
                  message="Your certificates are available in your dashboard"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Complete a course to earn a certificate
                </p>
                <Button
                  onClick={() => navigate('/courses')}
                  variant="primary"
                >
                  Explore Courses
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <Alert
            type="error"
            message="This action cannot be undone. All your data will be permanently deleted."
          />
          <p>Are you sure you want to delete your account?</p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="danger"
              loading={saving}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
