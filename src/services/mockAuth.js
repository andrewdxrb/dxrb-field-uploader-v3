// Mock Authentication for Testing - Simple password matching
// Test users that match what we created in the database
const testUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@dxrb.com',
    password: 'password123', // Simple password for testing
    role: 'admin',
    displayName: 'DXRB Admin',
    profilePicture: null,
    isActive: true
  },
  {
    id: 2,
    username: 'worker1',
    email: 'worker@dxrb.com',
    password: 'password', // Simple password for testing
    role: 'worker',
    displayName: 'Field Worker',
    profilePicture: null,
    isActive: true
  }
];

// Mock authentication functions
export const mockAuthAPI = {
  /**
   * Mock login function
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    const { email, password } = credentials;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email or username
    const user = testUsers.find(u => 
      u.email === email || u.username === email
    );
    
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }
    
    // Simple password check for testing
    if (password !== user.password) {
      throw new Error('Invalid credentials');
    }
    
    // Generate mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      profilePicture: user.profilePicture
    };
    
    return { user: userData, token };
  },

  /**
   * Mock token verification
   * @returns {Promise<Object>} User data
   */
  async verifyToken() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
      throw new Error('No valid session');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return user;
  },

  /**
   * Mock logout
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

// Mock upload API
export const mockUploadAPI = {
  /**
   * Mock upload session initialization
   */
  async initUploadSession(files, projectName = null) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const batchId = `batch-${Date.now()}`;
    const uploadSessions = files.map((file, index) => ({
      uploadId: `upload-${Date.now()}-${index}`,
      filename: file.name,
      fileSize: file.size,
      batchPosition: index + 1
    }));
    
    return {
      success: true,
      batchId,
      totalFiles: files.length,
      uploadSessions
    };
  },

  /**
   * Mock chunk upload
   */
  async uploadChunk(uploadId, chunkIndex, chunkData, isLastChunk = false) {
    // Simulate upload time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      uploadId,
      bytesUploaded: (chunkIndex + 1) * 1024 * 1024, // Mock 1MB per chunk
      progress: isLastChunk ? 100 : (chunkIndex + 1) * 20,
      isComplete: isLastChunk
    };
  }
};