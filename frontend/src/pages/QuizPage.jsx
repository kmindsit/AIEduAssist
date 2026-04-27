import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import quizService from '../services/quizService';
import enrollmentService from '../services/enrollmentService';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // States
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showShuffled, setShowShuffled] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!quiz || showResults || !timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, showResults, timeRemaining]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuiz(quizId);
      setQuiz(data);
      setTimeRemaining(data.timeLimit ? data.timeLimit * 60 : null); // Convert to seconds
      setShowShuffled(data.shuffleQuestions || false);
    } catch (error) {
      showNotification('Failed to load quiz', 'error');
    } finally {
      setLoading(false);
    }
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
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const allAnswered = () => {
    return quiz.questions.every((_, idx) => answers[idx] !== undefined);
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const submissionData = {
        quizId,
        answers: Object.entries(answers).map(([questionIndex, optionIndex]) => ({
          questionIndex: parseInt(questionIndex),
          selectedOptionIndex: optionIndex,
        })),
      };

      const result = await quizService.submitQuiz(submissionData);
      setResults(result);
      setShowResults(true);
      setShowConfirmSubmit(false);

      showNotification('Quiz submitted successfully!', 'success');

      // Mark content as complete if 100% score
      if (result.score === 100 && quiz.courseId) {
        try {
          await enrollmentService.markContentComplete(quiz.courseId, quizId);
        } catch (err) {
          console.error('Failed to mark as complete:', err);
        }
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to submit quiz',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
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

  const isTimeRunningOut = timeRemaining && timeRemaining < 60;

  if (loading) return <LoadingSpinner />;
  if (!quiz) return <Alert type="error" message="Quiz not found" />;

  if (showResults && results) {
    const passed = results.score >= (quiz.passingScore || 70);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-8">
          <Card className="text-center py-12">
            <div className="mb-8">
              {passed ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h1 className="text-4xl font-bold text-green-600 mb-2">
                    Quiz Passed!
                  </h1>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📚</div>
                  <h1 className="text-4xl font-bold text-blue-600 mb-2">
                    Quiz Completed
                  </h1>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Your Score</p>
                <p className="text-5xl font-bold text-blue-600">{results.score}%</p>
              </div>

              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <p className="text-gray-600">Correct</p>
                  <p className="text-2xl font-bold text-green-600">
                    {results.correctAnswers}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Incorrect</p>
                  <p className="text-2xl font-bold text-red-600">
                    {results.incorrectAnswers}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Unanswered</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {results.unanswered}
                  </p>
                </div>
              </div>

              {passed && results.certificateAwarded && (
                <Alert
                  type="success"
                  message="🏆 Certificate awarded! Check your profile to download it."
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
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/courses')}
                  variant="primary"
                  fullWidth
                >
                  Browse Courses
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-3xl mx-auto px-8">
        {/* Quiz Header */}
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            {timeRemaining && (
              <div
                className={`text-2xl font-bold px-6 py-2 rounded-lg ${
                  isTimeRunningOut
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm text-gray-600">
                {Object.keys(answers).length} answered
              </span>
            </div>
            <ProgressBar
              progress={Math.round(
                ((currentQuestion + 1) / quiz.questions.length) * 100
              )}
            />
          </div>
        </Card>

        {/* Question Card */}
        <Card className="mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {question.question}
            </h2>

            {question.questionType === 'multiple-choice' && (
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(currentQuestion, idx)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      answers[currentQuestion] === idx
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion] === idx
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {answers[currentQuestion] === idx && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Navigation and Submit */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handlePreviousQuestion}
            variant="outline"
            disabled={currentQuestion === 0}
          >
            ← Previous
          </Button>

          <div className="flex gap-2 flex-wrap justify-center max-w-sm">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition ${
                  idx === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[idx] !== undefined
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={() => setShowConfirmSubmit(true)}
              variant="primary"
              disabled={!allAnswered()}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              disabled={currentQuestion === quiz.questions.length - 1}
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
        title="Submit Quiz?"
      >
        <div className="space-y-4">
          <p>
            You have answered <strong>{Object.keys(answers).length}</strong> out of{' '}
            <strong>{quiz.questions.length}</strong> questions.
          </p>
          {!allAnswered() && (
            <Alert
              type="warning"
              message={`${quiz.questions.length - Object.keys(answers).length} question(s) are unanswered.`}
            />
          )}
          <p>Once submitted, you cannot change your answers.</p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowConfirmSubmit(false)}
              variant="outline"
              disabled={submitting}
            >
              Continue Quiz
            </Button>
            <Button
              onClick={handleSubmitQuiz}
              variant="primary"
              loading={submitting}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizPage;
