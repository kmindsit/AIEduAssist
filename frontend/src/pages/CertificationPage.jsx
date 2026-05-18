import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import quizService from '../services/quizService';
import userService from '../services/userService';
import courseService from '../services/courseService';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';

const CertificationPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // States
  const [course, setCourse] = useState(null);
  const [certification, setCertification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const PASSING_SCORE = 80; // 80% required for certification

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Timer effect - strict timing
  useEffect(() => {
    if (!certification || showResults || !timeRemaining || !quizStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        // Alert when 5 minutes left
        if (prev === 300) {
          showNotification('⚠️ 5 minutes remaining', 'warning');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [certification, showResults, timeRemaining, quizStarted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      // Get certification exam for this course
      const certData = await quizService.getCourseCertification(courseId);
      setCertification(certData);
      setTimeRemaining(certData.timeLimit * 60); // Convert to seconds
    } catch (error) {
      showNotification('Failed to load certification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    setShowConfirmStart(false);
    setQuizStarted(true);
  };

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < certification.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleAutoSubmit = async () => {
    showNotification('⏰ Time is up! Submitting your exam...', 'warning');
    await submitCertification(answers);
  };

  const allAnswered = () => {
    return certification.questions.every((_, idx) => answers[idx] !== undefined);
  };

  const submitCertification = async (submittedAnswers) => {
    try {
      setSubmitting(true);
      const submissionData = {
        courseId,
        answers: Object.entries(submittedAnswers).map(([questionIndex, optionIndex]) => ({
          questionIndex: parseInt(questionIndex),
          selectedOptionIndex: optionIndex,
        })),
      };

      const result = await quizService.submitCertification(submissionData);
      setResults(result);
      setShowResults(true);
      setShowConfirmSubmit(false);

      showNotification(
        result.score >= PASSING_SCORE
          ? '🎉 Certification Passed!'
          : '📚 Certification Not Passed',
        result.score >= PASSING_SCORE ? 'success' : 'error'
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to submit certification',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCertification = async () => {
    await submitCertification(answers);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeRunningOut = timeRemaining && timeRemaining < 300; // 5 minutes

  if (loading) return <LoadingSpinner />;
  if (!course || !certification) {
    return <Alert type="error" message="Certification not found" />;
  }

  // Pre-exam screen
  if (!quizStarted && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12">
        <div className="max-w-3xl mx-auto px-8">
          <Card className="mb-8 border-2 border-purple-300">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-4xl font-bold text-purple-600 mb-4">
                {course.title} Certification Exam
              </h1>
              <p className="text-lg text-gray-600">
                Complete this exam to earn an official certificate
              </p>
            </div>

            <div className="space-y-6">
              <Alert
                type="warning"
                message="⚠️ This is a proctored certification exam with strict rules."
              />

              <Card className="bg-purple-50 border border-purple-200">
                <h2 className="text-2xl font-bold mb-4 text-purple-900">Exam Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Number of Questions</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {certification.questions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time Limit</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {certification.timeLimit} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passing Score</p>
                    <p className="text-3xl font-bold text-green-600">{PASSING_SCORE}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Question Types</p>
                    <p className="text-lg font-bold text-gray-900">Multiple Choice</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-red-50 border border-red-200">
                <h2 className="text-lg font-bold mb-4 text-red-900">Important Rules</h2>
                <ul className="space-y-2 text-sm text-red-800">
                  <li>
                    ✓ You will have <strong>{certification.timeLimit} minutes</strong> to
                    complete this exam
                  </li>
                  <li>
                    ✓ You must answer a minimum of <strong>{PASSING_SCORE}%</strong> score
                    to pass
                  </li>
                  <li>✓ Once you start, you cannot pause or exit the exam</li>
                  <li>✓ Timer will auto-submit your exam when time runs out</li>
                  <li>✓ Your answers will be locked after submission</li>
                  <li>✓ You can attempt this certification only once</li>
                </ul>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  variant="outline"
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirmStart(true)}
                  variant="primary"
                  fullWidth
                  className="text-lg py-3"
                >
                  Start Certification Exam
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmStart}
          onClose={() => setShowConfirmStart(false)}
          title="Start Certification Exam?"
        >
          <div className="space-y-4">
            <Alert
              type="warning"
              message="Once you start, you cannot pause. Make sure you have 
                        a stable internet connection and {certification.timeLimit} minutes available."
            />
            <p>
              By starting this exam, you confirm that you are ready and understand all
              the rules.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowConfirmStart(false)}
                variant="outline"
              >
                Not Ready
              </Button>
              <Button
                onClick={handleStartExam}
                variant="primary"
              >
                I'm Ready - Start
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Results screen
  if (showResults && results) {
    const passed = results.score >= PASSING_SCORE;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12">
        <div className="max-w-2xl mx-auto px-8">
          <Card className="text-center py-12">
            <div className="mb-8">
              {passed ? (
                <>
                  <div className="text-7xl mb-4 animate-bounce">🎉</div>
                  <h1 className="text-4xl font-bold text-green-600 mb-2">
                    Congratulations!
                  </h1>
                  <p className="text-xl text-gray-600">
                    You have earned your certification!
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📚</div>
                  <h1 className="text-4xl font-bold text-orange-600 mb-2">
                    Not Passed
                  </h1>
                  <p className="text-xl text-gray-600">
                    You need {PASSING_SCORE}% to pass this certification
                  </p>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Your Score</p>
                <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {results.score}%
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <p className="text-gray-600">Correct</p>
                  <p className="text-3xl font-bold text-green-600">
                    {results.correctAnswers}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Incorrect</p>
                  <p className="text-3xl font-bold text-red-600">
                    {results.incorrectAnswers}
                  </p>
                </div>
              </div>

              {passed && results.certificateNumber && (
                <Card className="bg-green-50 border-2 border-green-300">
                  <h3 className="font-semibold text-lg mb-2 text-green-900">
                    Certificate Details
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Certificate Number: <span className="font-mono font-bold">{results.certificateNumber}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Issue Date: {new Date().toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => {
                      // Trigger PDF download
                      window.open(`/api/certificates/${results.certificateId}/pdf`);
                    }}
                    variant="primary"
                    fullWidth
                  >
                    📥 Download Certificate PDF
                  </Button>
                </Card>
              )}

              {!passed && (
                <Alert
                  type="info"
                  message={`You scored ${results.score}%. You need ${PASSING_SCORE}% to pass. Review the material and try again.`}
                />
              )}

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg">Detailed Results</h3>
                {results.detailedResults && results.detailedResults.length > 0 && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {results.detailedResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded border-l-4 ${
                          result.isCorrect
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                        }`}
                      >
                        <p className="font-semibold mb-2">Question {idx + 1}</p>
                        <p className="text-gray-700 mb-3">{result.question}</p>
                        <p className="text-sm">
                          <span className="font-semibold">Your answer: </span>
                          {result.userAnswer}
                        </p>
                        {!result.isCorrect && (
                          <p className="text-sm text-green-700 mt-2">
                            <span className="font-semibold">Correct answer: </span>
                            {result.correctAnswer}
                          </p>
                        )}
                        {result.explanation && (
                          <p className="text-sm text-gray-600 mt-3 italic">
                            {result.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  fullWidth
                >
                  Dashboard
                </Button>
                {passed && (
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="primary"
                    fullWidth
                  >
                    View My Certificate
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Exam in progress
  const question = certification.questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-8">
        {/* Sticky Header */}
        <Card className="mb-6 sticky top-0 z-50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-gray-900">
                {course.title} - Certification Exam
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {certification.questions.length}
              </p>
            </div>
            <div
              className={`text-3xl font-bold px-6 py-3 rounded-lg w-40 text-center ${
                isTimeRunningOut
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-purple-100 text-purple-600'
              }`}
            >
              ⏱️ {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              progress={Math.round(
                ((currentQuestion + 1) / certification.questions.length) * 100
              )}
            />
          </div>
        </Card>

        {/* Question */}
        <Card className="mb-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQuestion, idx)}
                  className={`w-full p-5 rounded-lg border-2 transition text-left ${
                    answers[currentQuestion] === idx
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentQuestion] === idx
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {answers[currentQuestion] === idx && (
                        <span className="text-white font-bold">✓</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handlePreviousQuestion}
            variant="outline"
            disabled={currentQuestion === 0}
          >
            ← Previous
          </Button>

          <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
            {certification.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition text-sm ${
                  idx === currentQuestion
                    ? 'bg-purple-600 text-white'
                    : answers[idx] !== undefined
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === certification.questions.length - 1 ? (
            <Button
              onClick={() => setShowConfirmSubmit(true)}
              variant="primary"
              className="text-lg px-8"
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              variant="primary"
            >
              Next →
            </Button>
          )}
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="Submit Certification Exam?"
      >
        <div className="space-y-4">
          <p>
            You have answered <strong>{Object.keys(answers).length}</strong> out of{' '}
            <strong>{certification.questions.length}</strong> questions.
          </p>
          {!allAnswered() && (
            <Alert
              type="warning"
              message={`${certification.questions.length - Object.keys(answers).length} question(s) are unanswered. Unanswered questions are marked as incorrect.`}
            />
          )}
          <Alert
            type="info"
            message="Once submitted, you cannot change your answers or retake this exam."
          />
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowConfirmSubmit(false)}
              variant="outline"
              disabled={submitting}
            >
              Continue Exam
            </Button>
            <Button
              onClick={handleSubmitCertification}
              variant="primary"
              loading={submitting}
            >
              Submit Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CertificationPage;
