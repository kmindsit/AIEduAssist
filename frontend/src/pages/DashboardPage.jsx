import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import enrollmentService from '../services/enrollmentService';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: enrollments, loading, error } = useFetch('/enrollments');

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <p className="text-gray-600 text-sm font-medium">Courses Enrolled</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {enrollments?.length || 0}
          </p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {enrollments?.filter((e) => e.status === 'active').length || 0}
          </p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {enrollments?.filter((e) => e.status === 'completed').length || 0}
          </p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm font-medium">Certificates</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {enrollments?.filter((e) => e.certificateEarned).length || 0}
          </p>
        </Card>
      </div>

      {/* Current Courses Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
          <Button
            variant="primary"
            onClick={() => navigate('/courses')}
          >
            Browse More Courses
          </Button>
        </div>

        {error && (
          <Card>
            <p className="text-red-600">Failed to load enrollments</p>
          </Card>
        )}

        {enrollments && enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card
                key={enrollment._id}
                hoverable
                onClick={() => navigate(`/course/${enrollment.courseId}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-grow">
                    {enrollment.courseId}
                  </h3>
                  <Badge
                    text={enrollment.status}
                    variant={
                      enrollment.status === 'completed' ? 'green' :
                      enrollment.status === 'active' ? 'blue' : 'gray'
                    }
                  />
                </div>

                <ProgressBar
                  progress={enrollment.progress}
                  label="Course Progress"
                  showPercentage
                />

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${enrollment.courseId}/content`);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
              <Button onClick={() => navigate('/courses')}>
                Explore Courses
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
