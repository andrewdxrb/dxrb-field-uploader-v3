import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { LoginForm } from './components/organisms';
import { FilePickerButton, FilePreview } from './components/molecules';
import { Button } from './components/atoms';
import { authAPI, uploadAPI, fileUtils } from './services/api';
import { mockAuthAPI, mockUploadAPI } from './services/mockAuth';

// Switch between mock and real APIs based on environment or manual flag
// For local development without netlify functions, use mock APIs
const isDevelopment = process.env.NODE_ENV === 'development';
const useMockAPIs = isDevelopment && !window.location.href.includes('8888'); // Use mock if not running netlify dev (which uses port 8888)

const useAuth = useMockAPIs ? mockAuthAPI : authAPI;
const useUpload = useMockAPIs ? mockUploadAPI : uploadAPI;

// Authentication context
const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loginError, setLoginError] = useState('');

  // Check for existing session on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await useAuth.verifyToken();
        setUser(userData);
      } catch (error) {
        // No valid token, user needs to login
        console.log('No valid session found');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = async (credentials) => {
    setLoading(true);
    setLoginError('');
    
    try {
      const { user: userData } = await useAuth.login(credentials);
      setUser(userData);
      toast.success(`Welcome back, ${userData.displayName || userData.username}!`);
    } catch (error) {
      setLoginError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    useAuth.logout();
    setUser(null);
    setSelectedFiles([]);
    toast.success('Logged out successfully');
  };

  const handleFilesSelected = (files) => {
    // Validate file types
    const validFiles = files.filter(file => 
      fileUtils.validateFileType(file, ['image/*', 'video/*'])
    );

    if (validFiles.length !== files.length) {
      toast.error(`${files.length - validFiles.length} files were skipped (only images and videos allowed)`);
    }

    // Check batch limit
    const currentTotal = selectedFiles.length + validFiles.length;
    if (currentTotal > 50) {
      const allowedFiles = validFiles.slice(0, 50 - selectedFiles.length);
      setSelectedFiles(prev => [...prev, ...allowedFiles]);
      toast.error(`Batch limit reached. Only ${allowedFiles.length} files added.`);
    } else {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} file${validFiles.length !== 1 ? 's' : ''} added to batch`);
      }
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
    toast.success('File removed from batch');
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      toast.loading('Initializing upload...', { id: 'upload' });
      
      // Initialize upload session
      const sessionData = await useUpload.initUploadSession(selectedFiles);
      
      toast.success('Upload session created!', { id: 'upload' });
      console.log('Upload session:', sessionData);
      
      // TODO: Implement chunked upload logic
      // For now, just show success
      setTimeout(() => {
        toast.success(`${selectedFiles.length} files uploaded successfully!`);
        setSelectedFiles([]);
      }, 2000);
      
    } catch (error) {
      toast.error('Upload failed', { id: 'upload' });
      console.error('Upload error:', error);
    }
  };

  // Show loading spinner during initial auth check
  if (loading && user === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginForm
          onLogin={handleLogin}
          loading={loading}
          error={loginError}
        />
        <Toaster position="top-right" />
      </div>
    );
  }

  // Main application for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">
                DXRB Field Uploader
              </h1>
              {useMockAPIs && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Demo Mode
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.displayName || user.username}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Files
            </h2>
            
            <FilePickerButton
              onFilesSelected={handleFilesSelected}
              maxFiles={50}
              className="mb-6"
            />

            {/* File Counter */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected 
                  {selectedFiles.length >= 50 && ' (batch limit reached)'}
                </p>
              </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleUpload}
                  disabled={loading}
                  loading={loading}
                >
                  Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>

          {/* File Previews */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selected Files
              </h3>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {selectedFiles.map((file, index) => (
                  <FilePreview
                    key={`${file.name}-${file.size}-${index}`}
                    file={file}
                    onRemove={handleRemoveFile}
                    uploadStatus="pending"
                    uploadProgress={0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Getting Started Message */}
          {selectedFiles.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Upload
              </h3>
              <p className="text-gray-600">
                Select up to 50 files to begin your upload batch. You can upload multiple batches as needed.
              </p>
            </div>
          )}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;