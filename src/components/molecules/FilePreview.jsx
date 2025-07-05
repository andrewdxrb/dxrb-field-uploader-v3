import React, { useState, useEffect } from 'react';
import { X, FileImage, Video, Eye } from 'lucide-react';
import { Button, Badge, ProgressBar } from '../atoms';

/**
 * FilePreview component - Preview selected files before upload
 * @param {Object} props - Component props
 * @param {File} props.file - File object to preview
 * @param {Function} props.onRemove - Callback when file is removed
 * @param {number} props.uploadProgress - Upload progress (0-100)
 * @param {string} props.uploadStatus - Upload status ('pending', 'uploading', 'completed', 'error')
 * @param {string} props.className - Additional CSS classes
 */
const FilePreview = ({
  file,
  onRemove,
  uploadProgress = 0,
  uploadStatus = 'pending',
  className = '',
  ...props
}) => {
  const [preview, setPreview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'uploading': return 'primary';
      case 'completed': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`relative bg-white rounded-xl border border-gray-200 p-4 ${className}`} {...props}>
      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(file)}
        className="absolute top-2 right-2 z-10 w-8 h-8 p-0 bg-white shadow-sm hover:bg-gray-50 rounded-full"
      >
        <X className="w-4 h-4 text-gray-500" />
      </Button>

      <div className="flex items-start space-x-3">
        {/* File preview/icon */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : file.type.startsWith('video/') ? (
            <Video className="w-8 h-8 text-gray-400" />
          ) : (
            <FileImage className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </h4>
            <Badge variant={getStatusColor(uploadStatus)} size="sm">
              {getStatusText(uploadStatus)}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-500 mb-2">
            {formatFileSize(file.size)} • {file.type}
          </p>

          {/* Upload progress */}
          {uploadStatus === 'uploading' && (
            <ProgressBar
              value={uploadProgress}
              size="sm"
              showPercentage={false}
              className="mb-2"
            />
          )}

          {/* File details toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
          >
            <Eye className="w-3 h-3 mr-1" />
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-700">Size:</span>
              <span className="text-gray-500 ml-1">{formatFileSize(file.size)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="text-gray-500 ml-1">{file.type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Modified:</span>
              <span className="text-gray-500 ml-1">
                {new Date(file.lastModified).toLocaleDateString()}
              </span>
            </div>
            {uploadStatus === 'uploading' && (
              <div>
                <span className="font-medium text-gray-700">Progress:</span>
                <span className="text-gray-500 ml-1">{uploadProgress}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;