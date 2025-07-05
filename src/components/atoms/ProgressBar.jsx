import React from 'react';

/**
 * ProgressBar component - Visual progress indicator
 * @param {Object} props - Component props
 * @param {number} props.value - Progress value (0-100)
 * @param {number} props.max - Maximum value (default: 100)
 * @param {string} props.size - Progress bar size ('sm', 'md', 'lg')
 * @param {string} props.color - Progress bar color variant
 * @param {boolean} props.showPercentage - Show percentage text
 * @param {string} props.className - Additional CSS classes
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showPercentage = true,
  className = '',
  ...props
}) => {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {percentage}%
          </span>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;