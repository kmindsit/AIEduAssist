import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Users, Star } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { useFetch } from '../hooks/useFetch';
import enrollmentService from '../services/enrollmentService';

export const CoursesPage = () => {
  const navigate = useNavigate();
  const { data: courses, loading, error } = useFetch('/courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [courseStats, setCourseStats] = useState({});

  useEffect(() => {
    if (courses && courses.length > 0) {
      loadEnrollmentStatus();
    }
  }, [courses]);

  const loadEnrollmentStatus = async () => {
    try {
      for (const course of courses) {
        const enrollment = await enrollmentService.getEnrollmentProgress(course.id);
        setEnrollmentStatus(prev => ({ ...prev, [course.id]: enrollment }));
        setCourseStats(prev => ({
          ...prev,
          [course.id]: {
            completionPercentage: enrollment?.completionPercentage || 0,
            lessonsCompleted: enrollment?.lessonsCompleted || 0,
            totalLessons: enrollment?.totalLessons || 0
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load enrollment status:', err);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      await enrollmentService.enrollInCourse(courseId);
      const enrollment = await enrollmentService.getEnrollmentProgress(courseId);
      setEnrollmentStatus(prev => ({ ...prev, [courseId]: enrollment }));
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  }) || [];

  if (error) return <Card><p className="text-red-600">Failed to load courses</p></Card>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses</h1>
        <p className="text-gray-600">Discover courses and expand your knowledge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2">
          <Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="search" />
        </div>
        <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-4">Showing {filteredCourses.length} courses</p>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrollmentStatus[course.id];
              const stats = courseStats[course.id] || {};

              return (
                <Card key={course.id} hoverable className="flex flex-col">
                  <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white text-4xl">📚</div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">{course.description?.substring(0, 100)}...</p>

                  <div className="flex justify-between items-center mb-4 text-sm">
                    <Badge text={course.level} variant="blue" size="sm" />
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={14} />
                      {course.duration || 10}h
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={14} />
                      {course.studentCount || 0}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      {course.rating || 4.5}
                    </div>
                  </div>

                  {isEnrolled ? (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700 flex items-center gap-1">
                          <CheckCircle size={14} />
                          Enrolled
                        </span>
                        <span className="text-xs text-gray-600">{stats.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.completionPercentage}%` }} /></div>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <Button fullWidth onClick={() => navigate(`/course/${course.id}`)}>Continue Learning</Button>
                    ) : (
                      <>
                        <Button fullWidth onClick={() => handleEnrollCourse(course.id)}>Enroll Now</Button>
                        <Button fullWidth variant="outline" onClick={() => navigate(`/course/${course.id}`)}>Preview</Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><div className="text-center py-12"><p className="text-gray-600">No courses found</p></div></Card>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
