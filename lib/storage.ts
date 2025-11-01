import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Check if Blob storage is configured
function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// Check if we're in a serverless/read-only environment
function isServerlessEnvironment(): boolean {
  // Vercel and most serverless environments set these environment variables
  // Only check for actual serverless environment indicators, not just NODE_ENV
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

// Check if KV is configured
function isKVConfigured(): boolean {
  return !!process.env.KV_URL && !!process.env.KV_REST_API_TOKEN;
}

// File-based storage (for local development)
export async function saveToFile(key: string, data: any): Promise<void> {
  const filePath = join(process.cwd(), 'data', `${key}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readFromFile(key: string): Promise<any> {
  const filePath = join(process.cwd(), 'data', `${key}.json`);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// KV-based storage (for production)
export async function saveToKV(key: string, data: any): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV storage is not configured. Please set KV_URL and KV_REST_API_TOKEN environment variables.');
  }
  
  // Dynamic import to avoid errors if @vercel/kv is not installed
  const kv = await import('@vercel/kv');
  await kv.kv.set(key, JSON.stringify(data));
}

export async function readFromKV(key: string): Promise<any> {
  if (!isKVConfigured()) {
    throw new Error('KV storage is not configured. Please set KV_URL and KV_REST_API_TOKEN environment variables.');
  }
  
  const kv = await import('@vercel/kv');
  const data = await kv.kv.get<string>(key);
  if (!data) {
    throw new Error(`Key ${key} not found in KV storage`);
  }
  return JSON.parse(data);
}

// Universal storage that works in both environments
export async function saveData(key: string, data: any): Promise<void> {
  // Try file storage first (for local dev)
  if (!isServerlessEnvironment()) {
    try {
      await saveToFile(key, data);
      return;
    } catch (fileError: any) {
      // If file write fails with EROFS, try KV if available
      if (fileError?.code === 'EROFS' && isKVConfigured()) {
        await saveToKV(key, data);
        return;
      }
      // Otherwise rethrow the error
      throw fileError;
    }
  }
  
  // In serverless environment, use KV
  if (isKVConfigured()) {
    await saveToKV(key, data);
  } else {
    // Try file storage as fallback even in serverless (might work in some environments)
    try {
      await saveToFile(key, data);
    } catch (fileError: any) {
      throw new Error(
        'Cannot save data: Filesystem is read-only and KV storage is not configured. ' +
        'Please set KV_URL and KV_REST_API_TOKEN environment variables for Vercel KV, ' +
        'or ensure file system is writable for local development.'
      );
    }
  }
}

export async function readData(key: string): Promise<any> {
  if (isServerlessEnvironment()) {
    if (isKVConfigured()) {
      return await readFromKV(key);
    } else {
      throw new Error(
        'Production environment detected but KV storage is not configured. ' +
        'Please set up Vercel KV or use local file storage in development.'
      );
    }
  } else {
    return await readFromFile(key);
  }
}

// File upload functions (for binary files like videos and images)
export async function uploadFileToStorage(
  file: File,
  type: 'video' | 'thumbnail'
): Promise<string> {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${sanitizedName}`;

  if (isServerlessEnvironment() && isBlobConfigured()) {
    // Use Vercel Blob Storage in production
    try {
      const { put } = await import('@vercel/blob');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const blob = await put(`${type}/${filename}`, buffer, {
        access: 'public',
        contentType: file.type || (type === 'video' ? 'video/mp4' : 'image/png'),
      });
      
      return blob.url;
    } catch (error) {
      console.error('Error uploading to Blob storage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload file to Blob storage: ${errorMessage}`);
    }
  } else {
    // Use local file system for development
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', type === 'video' ? 'videos' : 'thumbnails');
      if (!existsSync(uploadsDir)) {
        const { mkdir } = await import('fs/promises');
        await mkdir(uploadsDir, { recursive: true });
      }

      const filePath = join(uploadsDir, filename);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Return the public URL
      return `/uploads/${type === 'video' ? 'videos' : 'thumbnails'}/${filename}`;
    } catch (fileError: any) {
      // If file write fails with EROFS and Blob is available, try Blob
      if (fileError?.code === 'EROFS' && isBlobConfigured()) {
        return await uploadFileToStorage(file, type);
      }
      throw new Error(`Failed to upload file: ${fileError?.message || 'Unknown error'}`);
    }
  }
}

