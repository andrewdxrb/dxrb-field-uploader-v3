// Authentication API - Login and session management
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Database connection
const createDbClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
};

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const client = createDbClient();
  
  try {
    await client.connect();
    const { httpMethod, path } = event;
    const body = JSON.parse(event.body || '{}');

    // POST /auth - Handle login and verify actions
    if (httpMethod === 'POST') {
      const { action, email, password, token } = body;

      // Login action
      if (action === 'login') {

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password required' })
        };
      }

      // Find user by email or username
      const userQuery = `
        SELECT id, username, email, password_hash, role, display_name, 
               profile_picture_url, is_active, last_login
        FROM users 
        WHERE (email = $1 OR username = $1) AND is_active = true
      `;
      
      const userResult = await client.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      const user = userResult.rows[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      // Update last login
      await client.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user data (without password)
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.display_name,
        profilePicture: user.profile_picture_url,
        lastLogin: user.last_login
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: userData,
          token
        })
      };

      // Verify action  
    } else if (action === 'verify') {

      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token required' })
        };
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get fresh user data
        const userQuery = `
          SELECT id, username, email, role, display_name, 
                 profile_picture_url, is_active
          FROM users 
          WHERE id = $1 AND is_active = true
        `;
        
        const userResult = await client.query(userQuery, [decoded.userId]);
        
        if (userResult.rows.length === 0) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'User not found or inactive' })
          };
        }

        const user = userResult.rows[0];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              displayName: user.display_name,
              profilePicture: user.profile_picture_url
            }
          })
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }
    } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    await client.end();
  }
};