import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import aiTutoringService from '../services/aiTutoringService';
import enrollmentService from '../services/enrollmentService';
import Button from '../components/Button';
import Card from '../components/Card';
import HintPopover from '../components/HintPopover';
import { Lightbulb } from 'lucide-react';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [showHintPopover, setShowHintPopover] = useState(false);
  const [currentHint, setCurrentHint] = useState(null);
  const [hintCount, setHintCount] = useState(3);
  const [hintsUsed, setHintsUsed] = useState({});
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuiz(quizId);
      setQuiz(data);
      setHintCount(3);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleGetHint = async () => {
    const remaining = hintCount - Object.keys(hintsUsed).length;
    if (remaining <= 0 || !quiz) return;
    if (hintsUsed[currentQuestion]) {
      setCurrentHint(hintsUsed[currentQuestion]);
      setShowHintPopover(true);
      return;
    }

    try {
      setLoadingHint(true);
      const hint = await aiTutoringService.generateHint(quiz.questions[currentQuestion].id);
      setCurrentHint(hint.hint);
      setHintsUsed(prev => ({ ...prev, [currentQuestion]: hint.hint }));
      setShowHintPopover(true);
    } catch (error) {
      console.error('Failed to generate hint:', error);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const result = await quizService.submitQuiz({ quizId, answers });
      setResults(result);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center">Quiz not found</div>;

  if (showResults && results) {
    const passed = results.score >= (quiz.passingScore || 70);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-8">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
            <h1 className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-blue-600'}`}>
              {passed ? 'Quiz Passed!' : 'Quiz Completed'}
            </h1>
            <p className="text-5xl font-bold text-blue-600 mb-4">{results.score}%</p>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
              <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const hintsRemaining = hintCount - Object.keys(hintsUsed).length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-8">
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span className="text-sm text-gray-600">{Object.keys(answers).length} answered</span>
          </div>
        </Card>

        <Card className="mb-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex-1">{question.question}</h2>
              <button
                onClick={handleGetHint}
                disabled={hintsRemaining === 0 || loadingHint}
                className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  hintsRemaining === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                <Lightbulb size={16} />
                {loadingHint ? 'Loading...' : `Hint (${hintsRemaining})`}
              </button>
            </div>

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
                      {answers[currentQuestion] === idx && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-4">
          <Button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
            ← Previous
          </Button>
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmitQuiz} loading={submitting}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
              Next →
            </Button>
          )}
        </div>
      </div>

      <HintPopover isOpen={showHintPopover} onClose={() => setShowHintPopover(false)} hint={currentHint} hintsRemaining={hintsRemaining} />
    </div>
  );
};

export default QuizPage;
