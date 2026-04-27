import React from 'react';

export const Toggle = ({ 
  id, 
  checked = false, 
  onChange, 
  label, 
  disabled = false,
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ease-in-out duration-200 ${
          checked
            ? 'bg-blue-600'
            : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ease-in-out duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};

export default Toggle;
