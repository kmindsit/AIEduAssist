import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import ProgressBar from '../components/ProgressBar';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [newRating, setNewRating] = useState(5);
  const [ratingText, setRatingText] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(courseId);
      setCourse(data);

      // Check if user is enrolled
      if (user) {
        const enrollmentData = await enrollmentService.getEnrollmentByCourse(courseId);
        setEnrollment(enrollmentData);
      }
    } catch (error) {
      showNotification('Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await enrollmentService.enrollCourse(courseId);
      setShowEnrollModal(false);
      showNotification('Successfully enrolled in course!', 'success');
      fetchCourseDetails();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Enrollment failed', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const handleRateCourse = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await courseService.rateCourse(courseId, {
        rating: newRating,
        review: ratingText,
      });
      showNotification('Rating submitted successfully!', 'success');
      setNewRating(5);
      setRatingText('');
      fetchCourseDetails();
    } catch (error) {
      showNotification('Failed to submit rating', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <Alert type="error" message="Course not found" />;

  const isEnrolled = !!enrollment;
  const enrollmentProgress = enrollment?.progress || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative h-full flex flex-col justify-end p-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="primary">{course.level}</Badge>
              <Badge variant="secondary">{course.category}</Badge>
              {course.rating && (
                <Badge variant="success">⭐ {course.rating.toFixed(1)}</Badge>
              )}
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">{course.title}</h1>
            <p className="text-lg text-blue-100 max-w-2xl">{course.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {isEnrolled && (
          <Alert
            type="info"
            message={`You are enrolled in this course. Progress: ${enrollmentProgress}%`}
          />
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Course Info Card */}
          <Card className="col-span-2">
            {/* Tabs */}
            <div className="flex border-b mb-6">
              {['overview', 'content', 'reviews'].map((tab) => (
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                {course.instructor && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Instructor</h3>
                    <p className="text-gray-700">{course.instructor.name}</p>
                    {course.instructor.bio && (
                      <p className="text-gray-600 text-sm mt-2">{course.instructor.bio}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Difficulty Level</p>
                    <p className="text-lg font-semibold capitalize">{course.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-lg font-semibold">{course.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students Enrolled</p>
                    <p className="text-lg font-semibold">{course.enrolledCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-lg font-semibold">
                      ⭐ {course.rating?.toFixed(1) || 'Not rated'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module, idx) => (
                    <Card key={idx} className="bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{module.title}</h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                        <Badge variant="secondary">{module.type}</Badge>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-600">No content modules yet</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>

                {/* Add Review */}
                {user && isEnrolled && (
                  <Card className="bg-blue-50 border border-blue-200">
                    <h3 className="font-semibold mb-4">Leave a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewRating(star)}
                              className={`text-3xl transition ${
                                star <= newRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={ratingText}
                        onChange={(e) => setRatingText(e.target.value)}
                        placeholder="Share your experience with this course..."
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      />
                      <Button onClick={handleRateCourse} variant="primary">
                        Submit Review
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Reviews List */}
                {course.reviews && course.reviews.length > 0 ? (
                  course.reviews.map((review, idx) => (
                    <Card key={idx} className="bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">
                              {'★'.repeat(review.rating)}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.review}</p>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-600">No reviews yet</p>
                )}
              </div>
            )}
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-4">
                {course.price ? `$${course.price}` : 'Free'}
              </h3>

              {isEnrolled ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Your Progress</p>
                    <ProgressBar progress={enrollmentProgress} />
                  </div>
                  <Button
                    onClick={() => navigate(`/quiz/${courseId}`)}
                    variant="primary"
                    fullWidth
                  >
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowEnrollModal(true)}
                  variant="primary"
                  fullWidth
                >
                  Enroll Now
                </Button>
              )}
            </Card>

            {/* Course Stats */}
            <Card>
              <h4 className="font-semibold mb-4">Course Info</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Students</p>
                  <p className="font-semibold">{course.enrolledCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Difficulty</p>
                  <p className="font-semibold capitalize">{course.level}</p>
                </div>
                <div>
                  <p className="text-gray-600">Rating</p>
                  <p className="font-semibold">⭐ {course.rating?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Confirm Enrollment"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to enroll in <strong>{course.title}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            You will have access to all course materials and be able to take quizzes.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowEnrollModal(false)}
              variant="outline"
              disabled={enrolling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              variant="primary"
              loading={enrolling}
            >
              Confirm Enrollment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
