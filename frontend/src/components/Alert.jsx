import React from 'react';

export const Alert = ({ message, type = 'info', onClose, dismissible = true }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`border-l-4 p-4 rounded ${typeStyles[type]} flex items-start justify-between`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="mr-3 text-lg font-semibold">{icons[type]}</span>
        <p>{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
