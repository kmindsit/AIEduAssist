import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import { useFetch } from '../hooks/useFetch';

export const CoursesPage = () => {
  const navigate = useNavigate();
  const { data: courses, loading, error } = useFetch('/courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  }) || [];

  if (loading) return <LoadingSpinner text="Loading courses..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses</h1>
        <p className="text-gray-600">Discover thousands of courses and expand your knowledge</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="search"
          />
        </div>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <Button variant="outline">Filters</Button>
      </div>

      {/* Courses Grid */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
        </p>

        {error && (
          <Card>
            <p className="text-red-600">Failed to load courses</p>
          </Card>
        )}

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course._id}
                hoverable
                className="flex flex-col"
              >
                {/* Course Image Placeholder */}
                <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4"></div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {course.description?.substring(0, 100)}...
                </p>

                <div className="flex justify-between items-center mb-4">
                  <Badge text={course.level} variant="blue" size="sm" />
                  <span className="text-sm text-gray-600">
                    {course.duration} hours
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-gray-600">
                    {course.studentCount || 0} students
                  </span>
                  <span className="text-yellow-500">★ {course.rating || 4.5}</span>
                </div>

                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  View Course
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">No courses found. Try adjusting your filters.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
