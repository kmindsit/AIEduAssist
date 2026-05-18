import React from 'react';

export const Badge = ({ 
  text, 
  variant = 'blue',
  size = 'md',
  ...props 
}) => {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {text}
    </span>
  );
};

export default Badge;
