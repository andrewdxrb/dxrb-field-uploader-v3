// API Service Layer - Handles all backend communication
import axios from 'axios';
import toast from 'react-hot-toast';

// API base URL (development uses Netlify Dev, production uses deployed functions)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions' 
  : 'http://localhost:8888/.netlify/functions';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    // Don't show toast for auth verification (happens automatically)
    if (!error.config.url.includes('verify')) {
      toast.error(message);
    }
    
    // Redirect to login on 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('login')) {
        window.location.reload();
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  /**
   * User login
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    const response = await api.post('/auth', {
      ...credentials,
      action: 'login'
    });
    
    const { user, token } = response.data;
    
    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  },

  /**
   * Verify current token
   * @returns {Promise<Object>} User data
   */
  async verifyToken() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No token found');

    const response = await api.post('/auth', {
      token,
      action: 'verify'
    });
    
    const { user } = response.data;
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

// Upload API
export const uploadAPI = {
  /**
   * Initialize upload session for multiple files
   * @param {Array} files - Array of File objects
   * @param {string} projectName - Optional project name
   * @returns {Promise<Object>} Upload session data
   */
  async initUploadSession(files, projectName = null) {
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));

    const response = await api.post('/upload', {
      files: fileData,
      projectName,
      action: 'init'
    });

    return response.data;
  },

  /**
   * Upload a file chunk
   * @param {string} uploadId - Upload session ID
   * @param {number} chunkIndex - Chunk index (0-based)
   * @param {string} chunkData - Base64 encoded chunk data
   * @param {boolean} isLastChunk - Whether this is the final chunk
   * @returns {Promise<Object>} Upload progress data
   */
  async uploadChunk(uploadId, chunkIndex, chunkData, isLastChunk = false) {
    const response = await api.post('/upload', {
      uploadId,
      chunkIndex,
      chunkData,
      isLastChunk,
      action: 'chunk'
    });

    return response.data;
  },

  /**
   * Get upload batch status
   * @param {string} batchId - Batch ID
   * @returns {Promise<Object>} Batch status and progress
   */
  async getBatchStatus(batchId) {
    const response = await api.get(`/upload?action=status&batchId=${batchId}`);
    return response.data;
  }
};

// File processing utilities
export const fileUtils = {
  /**
   * Split file into chunks for upload
   * @param {File} file - File to chunk
   * @param {number} chunkSize - Size of each chunk in bytes (default: 5MB)
   * @returns {Promise<Array>} Array of base64 encoded chunks
   */
  async chunkFile(file, chunkSize = 5 * 1024 * 1024) {
    const chunks = [];
    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      const base64Chunk = await this.fileToBase64(chunk);
      chunks.push(base64Chunk);
      offset += chunkSize;
    }

    return chunks;
  },

  /**
   * Convert file/blob to base64
   * @param {File|Blob} file - File to convert
   * @returns {Promise<string>} Base64 string (without data: prefix)
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data:type;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {Array} allowedTypes - Allowed MIME types
   * @returns {boolean} Whether file type is allowed
   */
  validateFileType(file, allowedTypes = ['image/*', 'video/*']) {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
  },

  /**
   * Format file size in human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default api;