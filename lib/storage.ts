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
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

// File-based storage (for local development fallback)
async function saveToFile(key: string, data: any): Promise<void> {
  const filePath = join(process.cwd(), `${key}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function readFromFile(key: string): Promise<any> {
  const filePath = join(process.cwd(), `${key}.json`);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// Store blob URLs in memory cache (for reading)
// Note: Cache is per-instance, may be cleared on serverless restarts
const blobUrlCache = new Map<string, string>();

// Clear cache for a specific key (useful for forcing refresh)
function clearBlobCache(key?: string) {
  if (key) {
    blobUrlCache.delete(key);
  } else {
    blobUrlCache.clear();
  }
}

// Blob-based storage (primary storage method)
async function saveToBlob(key: string, data: any): Promise<void> {
  if (!isBlobConfigured()) {
    throw new Error('Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.');
  }
  
  try {
    const { put } = await import('@vercel/blob');
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    // Clear cache BEFORE saving to ensure subsequent reads get fresh data
    blobUrlCache.delete(key);
    
    const blob = await put(`data/${key}.json`, buffer, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true, // Allow overwriting existing blobs
    });
    
    // Don't cache the URL immediately - force re-list on next read to get latest
    // This ensures we always check for the latest blob after a save
    console.log(`Saved ${key} to Blob storage at: ${blob.url}, pathname: data/${key}.json`);
    
    // Small delay to ensure blob is fully committed (CDN propagation)
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error saving to Blob storage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save to Blob storage: ${errorMessage}`);
  }
}

async function readFromBlob(key: string, forceRefresh: boolean = false): Promise<any> {
  if (!isBlobConfigured()) {
    throw new Error('Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.');
  }
  
  try {
    const { list } = await import('@vercel/blob');
    
    const blobPath = `data/${key}.json`;
    let blobUrl: string | null = null;
    
    // If force refresh, always re-list to get the latest blob metadata
    // Otherwise, try to use cached URL first
    if (!forceRefresh) {
      blobUrl = blobUrlCache.get(key) || null;
    }
    
    if (!blobUrl) {
      // Use list to find the blob by pathname
      // Try exact path first, then broader search
      let blobs = await list({ prefix: blobPath });
      let matchingBlob = blobs.blobs.find(b => b.pathname === blobPath);
      
      // If not found, try listing all blobs with data/ prefix
      if (!matchingBlob) {
        blobs = await list({ prefix: 'data/' });
        matchingBlob = blobs.blobs.find(b => b.pathname === blobPath);
      }
      
      // Also try matching by the key name in the pathname
      if (!matchingBlob) {
        matchingBlob = blobs.blobs.find(b => 
          b.pathname.includes(`${key}.json`) || 
          b.pathname.endsWith(`${key}.json`) ||
          b.pathname === `data/${key}.json`
        );
      }
      
      if (matchingBlob) {
        blobUrl = matchingBlob.url;
        blobUrlCache.set(key, blobUrl);
        console.log(`Found blob for ${key} at pathname: ${matchingBlob.pathname}, URL: ${blobUrl}${forceRefresh ? ' (force refresh)' : ''}`);
      } else {
        // Log available blobs for debugging
        console.log(`Available blobs with prefix 'data/':`, blobs.blobs.map(b => b.pathname));
        throw new Error(`Key ${key} not found in Blob storage. Expected path: ${blobPath}`);
      }
    }
    
    // Fetch the blob content using the URL with aggressive cache-busting
    // Use both query param and headers to ensure fresh content
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBustUrl = `${blobUrl}?t=${timestamp}&r=${random}`;
    const response = await fetch(cacheBustUrl, {
      cache: 'no-store', // Prevent Next.js fetch caching
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error reading from Blob storage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to read from Blob storage: ${errorMessage}`);
  }
}

// Universal storage that uses Blob when available, falls back to file system
// Note: 'config' key always uses file system, never Blob storage
export async function saveData(key: string, data: any): Promise<void> {
  // Config is always stored in file system, never in Blob
  if (key === 'config') {
    if (isServerlessEnvironment()) {
      throw new Error(
        'Config cannot be saved in serverless environment. Config.json must be managed through version control and deployed with the application.'
      );
    }
    await saveToFile(key, data);
    return;
  }
  
  // For other keys (like videos), use Blob if configured
  if (isBlobConfigured()) {
    try {
      await saveToBlob(key, data);
      return;
    } catch (blobError: any) {
      // If Blob fails and we're not in serverless, try file fallback
      if (!isServerlessEnvironment()) {
        console.warn('Blob save failed, falling back to file storage:', blobError.message);
        await saveToFile(key, data);
        return;
      }
      // In serverless, Blob is required for dynamic content
      throw blobError;
    }
  }
  
  // If Blob is not configured, use file storage (local development only)
  if (!isServerlessEnvironment()) {
    try {
      await saveToFile(key, data);
      return;
    } catch (fileError: any) {
      // If file write fails with EROFS, suggest Blob configuration
      if (fileError?.code === 'EROFS') {
        throw new Error(
          'Cannot write to filesystem. Please configure Vercel Blob storage by setting BLOB_READ_WRITE_TOKEN environment variable.'
        );
      }
      throw fileError;
    }
  } else {
    // In serverless without Blob, we can't save dynamic content
    throw new Error(
      'Blob storage is required in serverless environments for dynamic content. Please set BLOB_READ_WRITE_TOKEN environment variable.'
    );
  }
}

export async function readData(key: string, forceRefresh: boolean = false): Promise<any> {
  // Config is always read from file system, never from Blob
  if (key === 'config') {
    return await readFromFile(key);
  }
  
  // Clear cache if force refresh is requested
  if (forceRefresh) {
    blobUrlCache.delete(key);
  }
  
  // For other keys (like videos), try Blob first if configured
  if (isBlobConfigured()) {
    try {
      const data = await readFromBlob(key, forceRefresh);
      console.log(`Successfully read ${key} from Blob storage${forceRefresh ? ' (forced refresh)' : ''}`);
      return data;
    } catch (blobError: any) {
      console.error(`Blob read failed for ${key}:`, blobError.message);
      // If Blob read fails and we're not in serverless, try file fallback
      if (!isServerlessEnvironment()) {
        console.warn(`Blob read failed for ${key}, falling back to file storage:`, blobError.message);
        try {
          const fileData = await readFromFile(key);
          console.log(`Successfully read ${key} from file storage (fallback)`);
          return fileData;
        } catch (fileError: any) {
          // If file read also fails, throw with helpful message
          throw new Error(
            `Failed to read ${key} from both Blob storage (${blobError.message}) and file storage (${fileError.message})`
          );
        }
      }
      // In serverless, rethrow the error
      throw blobError;
    }
  }
  
  // If Blob is not configured, use file storage
  console.log(`Blob not configured, reading ${key} from file storage`);
  return await readFromFile(key);
}

// File upload functions (for binary files like videos and images)
export async function uploadFileToStorage(
  file: File,
  type: 'video' | 'thumbnail'
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${sanitizedName}`;

  // Always try Blob first if configured
  if (isBlobConfigured()) {
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
      // If Blob fails and we're not in serverless, try file fallback
      if (!isServerlessEnvironment()) {
        console.warn('Blob upload failed, falling back to file storage');
        // Continue to file storage fallback below
      } else {
        // In serverless, Blob is required
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to upload file to Blob storage: ${errorMessage}`);
      }
    }
  }
  
  // Fallback to local file system (local development only)
  if (!isServerlessEnvironment()) {
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
      // If file write fails with EROFS, suggest Blob configuration
      if (fileError?.code === 'EROFS') {
        throw new Error(
          'Cannot write to filesystem. Please configure Vercel Blob storage by setting BLOB_READ_WRITE_TOKEN environment variable.'
        );
      }
      throw new Error(`Failed to upload file: ${fileError?.message || 'Unknown error'}`);
    }
  } else {
    // In serverless without Blob, we can't upload
    throw new Error(
      'Blob storage is required in serverless environments. Please set BLOB_READ_WRITE_TOKEN environment variable.'
    );
  }
}

