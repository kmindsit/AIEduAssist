import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export default function ProgressTracker({ course, progress }) {
  if (!progress) return null;

  const completed = progress.lessons_completed || 0;
  const total = progress.total_lessons || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const timeSpent = progress.time_spent_hours || 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-800">{course.title}</h4>
        <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
          {completed}/{total} lessons
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-orange-600" />
          {timeSpent.toFixed(1)} hours
        </div>
      </div>

      {percentage === 100 && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded text-sm">
          🎉 Course completed! Check your certificates.
        </div>
      )}
    </div>
  );
}
