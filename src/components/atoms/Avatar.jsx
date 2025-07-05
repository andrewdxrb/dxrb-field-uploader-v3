import React from 'react';
import { User } from 'lucide-react';

/**
 * Avatar component - User profile picture display
 * @param {Object} props - Component props
 * @param {string} props.src - Avatar image source
 * @param {string} props.alt - Alt text for image
 * @param {string} props.name - User name for fallback initials
 * @param {string} props.size - Avatar size ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({
  src,
  alt,
  name = '',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const baseClasses = `
    relative inline-flex items-center justify-center rounded-full 
    bg-gray-100 text-gray-600 font-medium overflow-hidden
    ${sizeClasses[size]} ${className}
  `;

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={baseClasses}
        {...props}
      />
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  );
};

export default Avatar;