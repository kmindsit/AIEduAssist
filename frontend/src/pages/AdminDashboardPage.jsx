import React, { useState, useEffect } from 'react';
import { Download, Loader, AlertCircle } from 'lucide-react';
import adminService from '../services/adminService';
import Button from '../components/Button';
import Card from '../components/Card';
import AnalyticsCard from '../components/AnalyticsCard';
import MetricsChart from '../components/MetricsChart';
import UserTable from '../components/UserTable';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, userAnalyticsData, courseAnalyticsData, usersData] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getUserAnalytics(),
        adminService.getCourseAnalytics(),
        adminService.getAllUsers({ limit: 50 })
      ]);
      setOverview(overviewData);
      setUserAnalytics(userAnalyticsData);
      setCourseAnalytics(courseAnalyticsData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const blob = await adminService.exportAnalyticsReport('pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><AlertCircle className="mr-2 inline" />{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform analytics and user management</p>
          </div>
          <Button onClick={handleExportReport} disabled={exporting}>
            <Download className="mr-2 inline" size={16} />{exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>

        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AnalyticsCard label="Total Users" value={overview.totalUsers || 0} icon="users" color="blue" />
            <AnalyticsCard label="Active Users" value={overview.activeUsersWeek || 0} icon="activity" color="green" />
            <AnalyticsCard label="Total Courses" value={overview.totalCourses || 0} icon="courses" color="purple" />
            <AnalyticsCard label="Certificates" value={overview.certificatesIssued || 0} icon="certificates" color="orange" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {userAnalytics && (
            <Card>
              <MetricsChart title="User Growth" data={userAnalytics.growth || []} type="line" />
            </Card>
          )}
          {courseAnalytics && (
            <Card>
              <MetricsChart title="Top Courses" data={courseAnalytics.topCourses || []} type="bar" />
            </Card>
          )}
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
          <UserTable users={users} />
        </Card>
      </div>
    </div>
  );
}
