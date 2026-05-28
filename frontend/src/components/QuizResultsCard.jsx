import React from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function QuizResultsCard({ results, onRetake }) {
  if (!results) return null;

  const passed = results.score >= (results.passingScore || 70);
  const scorePercentage = Math.round(results.score || 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        {passed ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}
        <h2 className="text-3xl font-bold mb-2">
          {passed ? '🎉 Congratulations!' : '📚 Keep Practicing!'}
        </h2>
        <p className="text-gray-600">
          {passed ? 'You passed the quiz!' : 'You need to score higher to pass.'}
        </p>
      </div>

      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-6xl font-bold text-blue-600">{scorePercentage}%</div>
          <p className="text-gray-600 mt-2">Your Score</p>
        </div>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {results.questions_correct || 0}
            </p>
            <p className="text-sm text-gray-600">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {(results.questions_answered || 0) - (results.questions_correct || 0)}
            </p>
            <p className="text-sm text-gray-600">Incorrect</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {results.passingScore || 70}%
            </p>
            <p className="text-sm text-gray-600">Passing Score</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <div className="space-y-2">
          {passed ? (
            <>
              <p className="text-green-700 bg-green-100 p-3 rounded">
                ✅ You can now move to the next lesson
              </p>
              <p className="text-blue-700 bg-blue-100 p-3 rounded">
                💡 Review challenging questions to reinforce your learning
              </p>
            </>
          ) : (
            <>
              <p className="text-orange-700 bg-orange-100 p-3 rounded">
                📖 Review the course material again
              </p>
              <p className="text-blue-700 bg-blue-100 p-3 rounded">
                💡 Consider using the study guide for additional help
              </p>
              <p className="text-purple-700 bg-purple-100 p-3 rounded">
                🤖 Get AI hints when you retake the quiz
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="primary" onClick={onRetake} fullWidth>
          <RotateCcw className="w-4 h-4 mr-2 inline" /> Retake Quiz
        </Button>
      </div>
    </div>
  );
}
