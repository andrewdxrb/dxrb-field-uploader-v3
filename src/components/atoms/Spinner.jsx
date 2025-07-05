import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Spinner component - Loading spinner indicator
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size ('sm', 'md', 'lg')
 * @param {string} props.color - Spinner color
 * @param {string} props.className - Additional CSS classes
 */
const Spinner = ({
  size = 'md',
  color = 'text-primary-600',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${color} ${className}`}
      {...props}
    />
  );
};

export default Spinner;