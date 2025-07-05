import React, { useRef, useState } from 'react';
import { Upload, Camera, FileImage, Video } from 'lucide-react';
import { Button } from '../atoms';

/**
 * FilePickerButton component - Custom file picker that avoids native browser issues
 * @param {Object} props - Component props
 * @param {Function} props.onFilesSelected - Callback when files are selected
 * @param {boolean} props.multiple - Allow multiple file selection
 * @param {string} props.accept - File types to accept
 * @param {number} props.maxFiles - Maximum number of files (default: 50)
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 */
const FilePickerButton = ({
  onFilesSelected,
  multiple = true,
  accept = 'image/*,video/*',
  maxFiles = 50,
  disabled = false,
  className = '',
  ...props
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // Handle file input change
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Limit to maxFiles
      const limitedFiles = files.slice(0, maxFiles);
      onFilesSelected(limitedFiles);
    }
    // Reset input value to allow selecting the same files again
    event.target.value = '';
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      // Filter files by accept type
      const validFiles = files.filter(file => {
        if (accept === 'image/*,video/*') {
          return file.type.startsWith('image/') || file.type.startsWith('video/');
        }
        return true;
      });
      
      // Limit to maxFiles
      const limitedFiles = validFiles.slice(0, maxFiles);
      onFilesSelected(limitedFiles);
    }
  };

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        {...props}
      />

      {/* Drag and drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200
          ${dragOver 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={handleButtonClick}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <Camera className="w-8 h-8 text-gray-400" />
            <FileImage className="w-8 h-8 text-gray-400" />
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Choose Files to Upload
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-400">
              Maximum {maxFiles} files • Images and videos supported
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={disabled}
            className="pointer-events-none"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Files
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilePickerButton;