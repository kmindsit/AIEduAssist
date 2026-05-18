import React, { useState, useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';
import analyticsService from '../services/analyticsService';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';

const AnalyticsPage = () => {
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [quizPerformance, setQuizPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analytics, path, progress, quiz, recs] = await Promise.all([
        analyticsService.getUserAnalytics(),
        analyticsService.getLearningPath(),
        analyticsService.getCourseProgress(),
        analyticsService.getQuizPerformance(),
        analyticsService.getRecommendations(),
      ]);

      setAnalytics(analytics);
      setLearningPath(path);
      setCourseProgress(progress);
      setQuizPerformance(quiz);
      setRecommendations(recs);
    } catch (error) {
      showNotification('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Learning Analytics
          </h1>
          <p className="text-gray-600">
            Track your progress and gain insights into your learning journey
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {['overview', 'courses', 'quizzes', 'recommendations'].map((tab) => (
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

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="text-center">
                <p className="text-4xl font-bold text-blue-600">
                  {analytics.totalCourses || 0}
                </p>
                <p className="text-gray-600 mt-2">Courses Enrolled</p>
              </Card>
              <Card className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  {analytics.completedCourses || 0}
                </p>
                <p className="text-gray-600 mt-2">Completed</p>
              </Card>
              <Card className="text-center">
                <p className="text-4xl font-bold text-purple-600">
                  {analytics.certificatesEarned || 0}
                </p>
                <p className="text-gray-600 mt-2">Certificates</p>
              </Card>
              <Card className="text-center">
                <p className="text-4xl font-bold text-orange-600">
                  {Math.round(analytics.averageScore || 0)}%
                </p>
                <p className="text-gray-600 mt-2">Avg Score</p>
              </Card>
            </div>

            {/* Learning Path */}
            {learningPath && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Your Learning Path</h2>
                <div className="space-y-6">
                  {learningPath.milestones && learningPath.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            milestone.completed
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          {milestone.completed ? '✓' : idx + 1}
                        </div>
                        {idx < learningPath.milestones.length - 1 && (
                          <div className="absolute top-10 left-5 w-1 h-12 bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {milestone.description}
                        </p>
                        {milestone.completedDate && (
                          <p className="text-xs text-green-600 mt-2">
                            ✓ Completed on {new Date(milestone.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Study Statistics */}
            <Card>
              <h2 className="text-2xl font-bold mb-6">Study Statistics</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 mb-2">Total Study Hours</p>
                  <p className="text-5xl font-bold text-blue-600">
                    {Math.round(analytics.totalStudyHours || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {analytics.dailyAverageHours?.toFixed(1) || 0} hours per day
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">Current Streak</p>
                  <p className="text-5xl font-bold text-orange-600">
                    {analytics.currentStreak || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    days of consecutive learning
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && courseProgress && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Course Progress</h2>
            {courseProgress.courses && courseProgress.courses.length > 0 ? (
              <div className="space-y-4">
                {courseProgress.courses.map((course) => (
                  <Card key={course._id}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {course.instructor}
                          </p>
                        </div>
                        <Badge
                          variant={
                            course.progress === 100
                              ? 'success'
                              : 'primary'
                          }
                        >
                          {course.status}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            {course.progress}%
                          </span>
                        </div>
                        <ProgressBar progress={course.progress} />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-600">Lessons Complete</p>
                          <p className="text-lg font-bold text-blue-600">
                            {course.lessonsCompleted}/{course.totalLessons}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-600">Quizzes Taken</p>
                          <p className="text-lg font-bold text-purple-600">
                            {course.quizzesTaken}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-600">Avg Score</p>
                          <p className="text-lg font-bold text-green-600">
                            {Math.round(course.averageScore || 0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <p className="text-gray-600">No courses started yet</p>
              </Card>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && quizPerformance && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Quiz Performance</h2>

            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center">
                <p className="text-4xl font-bold text-blue-600">
                  {quizPerformance.totalAttempts || 0}
                </p>
                <p className="text-gray-600 mt-2">Quizzes Taken</p>
              </Card>
              <Card className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  {quizPerformance.quizzesPassed || 0}
                </p>
                <p className="text-gray-600 mt-2">Passed</p>
              </Card>
              <Card className="text-center">
                <p className="text-4xl font-bold text-purple-600">
                  {Math.round(quizPerformance.averageScore || 0)}%
                </p>
                <p className="text-gray-600 mt-2">Avg Score</p>
              </Card>
            </div>

            {quizPerformance.recentQuizzes && (
              <Card>
                <h3 className="font-bold text-lg mb-4">Recent Quiz Results</h3>
                <div className="space-y-3">
                  {quizPerformance.recentQuizzes.map((quiz, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {quiz.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(quiz.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            quiz.passed
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {quiz.score}%
                        </p>
                        <p className="text-xs text-gray-600">
                          {quiz.passed ? 'Passed' : 'Failed'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && recommendations && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Personalized Recommendations</h2>

            {recommendations.nextCourses && (
              <Card>
                <h3 className="font-bold text-lg mb-4">📚 Recommended Courses</h3>
                <div className="space-y-3">
                  {recommendations.nextCourses.map((course, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {course.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {course.reason}
                          </p>
                          <Badge variant="primary" className="mt-2">
                            {course.difficulty}
                          </Badge>
                        </div>
                        <Button variant="primary" size="sm">
                          Start Course
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {recommendations.weakAreas && (
              <Card>
                <h3 className="font-bold text-lg mb-4">
                  ⚠️ Areas to Improve
                </h3>
                <div className="space-y-4">
                  {recommendations.weakAreas.map((area, idx) => (
                    <div key={idx} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {area.topic}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {area.reason}
                          </p>
                          <p className="text-xs text-orange-600 mt-2">
                            Latest score: {area.score}%
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {recommendations.skillToGain && (
              <Card>
                <h3 className="font-bold text-lg mb-4">
                  🎯 Skills You Can Gain
                </h3>
                <div className="flex flex-wrap gap-3">
                  {recommendations.skillToGain.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
