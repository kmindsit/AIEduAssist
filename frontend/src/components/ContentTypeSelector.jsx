import React from 'react';

export default function ContentTypeSelector({ value, onChange }) {
  const contentTypes = [
    {
      id: 'outline',
      label: 'Course Outline',
      description: 'Structured overview of course topics and sections',
      icon: '📋'
    },
    {
      id: 'problems',
      label: 'Practice Problems',
      description: 'Collection of problems with solutions',
      icon: '📝'
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      description: 'Interactive flashcard sets for quick learning',
      icon: '🎴'
    },
    {
      id: 'summary',
      label: 'Content Summary',
      description: 'Concise summary of main concepts',
      icon: '📄'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-900">
        Content Type
      </label>
      <div className="space-y-2">
        {contentTypes.map(type => (
          <label key={type.id} className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors"
            style={{
              borderColor: value === type.id ? '#3b82f6' : '#e5e7eb',
              backgroundColor: value === type.id ? '#eff6ff' : '#f9fafb'
            }}
          >
            <div className="flex items-center h-6 mt-0.5">
              <input
                type="radio"
                value={type.id}
                checked={value === type.id}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{type.icon}</span>
                <span className="font-medium text-gray-900">{type.label}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
