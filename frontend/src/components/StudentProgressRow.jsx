import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function StudentProgressRow({ student, course }) {
  const getStatusIcon = (progress) => {
    if (progress === 100) return <CheckCircle size={16} className="text-green-600" />;
    if (progress >= 50) return <Clock size={16} className="text-blue-600" />;
    return <AlertCircle size={16} className="text-orange-600" />;
  };

  const getStatusColor = (progress) => {
    if (progress === 100) return 'bg-green-50 border-green-200';
    if (progress >= 50) return 'bg-blue-50 border-blue-200';
    return 'bg-orange-50 border-orange-200';
  };

  return (
    <div className={`border-l-4 p-4 rounded ${getStatusColor(student.completionPercentage)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(student.completionPercentage)}
            <h4 className="font-semibold text-gray-900">{student.name}</h4>
          </div>
          <p className="text-sm text-gray-600">{student.email}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{student.currentScore}%</p>
          <p className="text-xs text-gray-600">Current Score</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className="text-xs font-medium text-gray-900">{student.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${student.completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-white bg-opacity-50 p-2 rounded">
          <p className="text-xs text-gray-600">Lessons</p>
          <p className="font-semibold text-gray-900">
            {student.lessonsCompleted}/{student.totalLessons}
          </p>
        </div>
        <div className="bg-white bg-opacity-50 p-2 rounded">
          <p className="text-xs text-gray-600">Quizzes</p>
          <p className="font-semibold text-gray-900">
            {student.quizzesPassed}/{student.totalQuizzes}
          </p>
        </div>
        <div className="bg-white bg-opacity-50 p-2 rounded">
          <p className="text-xs text-gray-600">Time</p>
          <p className="font-semibold text-gray-900">{student.hoursSpent}h</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          {student.completionPercentage === 100 && (
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
              ✓ Completed
            </span>
          )}
          {student.completionPercentage >= 50 && student.completionPercentage < 100 && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
              → In Progress
            </span>
          )}
          {student.completionPercentage < 50 && (
            <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
              ⚠ Not Started
            </span>
          )}
        </div>
        <span className="text-xs text-gray-600">
          Last active: {new Date(student.lastActive).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
