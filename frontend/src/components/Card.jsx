import React from 'react';

export const Card = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
  ...props 
}) => {
  const hoverClass = hoverable ? 'hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer' : '';
  
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${hoverClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
