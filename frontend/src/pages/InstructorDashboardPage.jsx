import React, { useState, useEffect } from 'react';
import { Download, Loader, AlertCircle, BarChart3 } from 'lucide-react';
import enrollmentService from '../services/enrollmentService';
import courseService from '../services/courseService';
import Button from '../components/Button';
import Card from '../components/Card';
import AnalyticsCard from '../components/AnalyticsCard';
import StudentProgressRow from '../components/StudentProgressRow';

export default function InstructorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseStats, setCourseStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchCourseDetails();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      const instructorCourses = data.filter(c => c.instructorId || c.isInstructorCourse);
      setCourses(instructorCourses);
      if (instructorCourses.length > 0) setSelectedCourse(instructorCourses[0].id);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      const [stats, enrolledStudents] = await Promise.all([
        enrollmentService.getCourseStats(selectedCourse),
        enrollmentService.getCourseStudents(selectedCourse)
      ]);
      setCourseStats(stats);
      setStudents(enrolledStudents);
    } catch (err) {
      console.error('Failed to load course details:', err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><AlertCircle className="mr-2 inline" />{error}</div>;
  if (courses.length === 0) return <div className="min-h-screen bg-gray-50 py-12"><div className="text-center"><BarChart3 className="mx-auto text-gray-300 mb-4" size={48} /><h1 className="text-2xl font-bold text-gray-900">No Courses</h1></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your courses and track student progress</p>
        </div>

        <Card>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Select Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                {courses.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
              </select>
            </div>
          </div>
        </Card>

        {courseStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AnalyticsCard label="Enrolled" value={courseStats.enrolledStudents || 0} icon="users" color="blue" />
            <AnalyticsCard label="Avg Completion" value={`${courseStats.avgCompletion || 0}%`} icon="activity" color="green" />
            <AnalyticsCard label="Avg Score" value={`${courseStats.avgQuizScore || 0}%`} icon="courses" color="purple" />
            <AnalyticsCard label="Rating" value={`${courseStats.rating || 0}/5`} icon="certificates" color="orange" />
          </div>
        )}

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Progress</h2>
          {students.length > 0 ? (
            <div className="space-y-4">
              {students.map(s => (
                <StudentProgressRow key={s.id} student={s} course={{ id: selectedCourse }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">No students enrolled</div>
          )}
        </Card>
      </div>
    </div>
  );
}
