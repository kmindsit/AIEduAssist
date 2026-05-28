import React from 'react';
import { TrendingUp, TrendingDown, Users, BookOpen, Award, Activity } from 'lucide-react';

export default function AnalyticsCard({ label, value, trend, icon, color = 'blue' }) {
  const iconMap = {
    users: Users,
    courses: BookOpen,
    certificates: Award,
    activity: Activity,
    trending: TrendingUp
  };

  const IconComponent = iconMap[icon] || Users;

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  const isTrendingUp = trend && trend > 0;

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isTrendingUp ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span className={`text-sm font-medium ${isTrendingUp ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}% {isTrendingUp ? 'up' : 'down'}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <IconComponent size={24} />
        </div>
      </div>
    </div>
  );
}
