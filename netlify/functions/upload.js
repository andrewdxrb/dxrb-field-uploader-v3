// Upload API - Handle file uploads and chunked uploads
import { Client } from 'pg';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Content-Type': 'application/json'
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
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

    // Get authorization token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization header required' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    // POST /upload - Handle upload actions
    if (httpMethod === 'POST') {
      const { action, files, batchId, projectName, uploadId, chunkIndex, chunkData, isLastChunk } = body;

      // Initialize upload session
      if (action === 'init') {
        if (!files || !Array.isArray(files) || files.length === 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Files array required' })
          };
        }

        if (files.length > 50) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Maximum 50 files per batch' })
          };
        }

        const generatedBatchId = batchId || uuidv4();
        const uploadSessions = [];

        // Create upload session for each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadId = uuidv4();
          
          const insertQuery = `
            INSERT INTO upload_sessions (
              upload_id, user_id, filename, file_size, 
              batch_id, batch_total_files, batch_current_file, 
              metadata, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
          `;

          const metadata = {
            originalName: file.name,
            mimeType: file.type,
            lastModified: file.lastModified,
            projectName: projectName || null
          };

          const result = await client.query(insertQuery, [
            uploadId,
            decoded.userId,
            file.name,
            file.size,
            generatedBatchId,
            files.length,
            i + 1,
            JSON.stringify(metadata),
            'pending'
          ]);

          uploadSessions.push({
            uploadId,
            filename: file.name,
            fileSize: file.size,
            batchPosition: i + 1
          });
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            batchId: generatedBatchId,
            totalFiles: files.length,
            uploadSessions
          })
        };

      // Upload chunk
      } else if (action === 'chunk') {
        if (!uploadId || chunkIndex === undefined || !chunkData) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'uploadId, chunkIndex, and chunkData required' })
          };
        }

        // Get upload session
        const sessionQuery = 'SELECT * FROM upload_sessions WHERE upload_id = $1 AND user_id = $2';
        const sessionResult = await client.query(sessionQuery, [uploadId, decoded.userId]);

        if (sessionResult.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Upload session not found' })
          };
        }

        const session = sessionResult.rows[0];

        // Calculate chunk size (base64 decoded size)
        const chunkSize = Buffer.from(chunkData, 'base64').length;
        const newBytesUploaded = session.bytes_uploaded + chunkSize;

        // Update upload progress
        const updateQuery = `
          UPDATE upload_sessions 
          SET bytes_uploaded = $1, 
              status = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE upload_id = $3
        `;

        const newStatus = isLastChunk ? 'ready_for_processing' : 'uploading';
        await client.query(updateQuery, [newBytesUploaded, newStatus, uploadId]);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            uploadId,
            bytesUploaded: newBytesUploaded,
            totalBytes: session.file_size,
            progress: Math.round((newBytesUploaded / session.file_size) * 100),
            isComplete: isLastChunk
          })
        };

      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
      }
    }

    // GET /upload/status/:batchId - Get batch upload status
    if (httpMethod === 'GET' && path.includes('status')) {
      const batchId = path.split('/').pop();

      const statusQuery = `
        SELECT upload_id, filename, file_size, bytes_uploaded, 
               status, batch_current_file, batch_total_files,
               created_at, updated_at
        FROM upload_sessions 
        WHERE batch_id = $1 AND user_id = $2
        ORDER BY batch_current_file
      `;

      const result = await client.query(statusQuery, [batchId, decoded.userId]);

      const uploads = result.rows.map(row => ({
        uploadId: row.upload_id,
        filename: row.filename,
        fileSize: row.file_size,
        bytesUploaded: row.bytes_uploaded,
        progress: Math.round((row.bytes_uploaded / row.file_size) * 100),
        status: row.status,
        batchPosition: row.batch_current_file,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      const totalFiles = uploads.length;
      const completedFiles = uploads.filter(u => u.status === 'completed').length;
      const batchProgress = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          batchId,
          totalFiles,
          completedFiles,
          batchProgress,
          uploads
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    await client.end();
  }
};