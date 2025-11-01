# Storage Setup Guide

## Problem

In serverless environments (like Vercel), the filesystem is read-only, which prevents writing to JSON files and uploading video/image files directly. This application uses a hybrid storage approach that works in both local development and production.

## Solution

The app automatically detects the environment and uses:
- **File storage** for local development (writes to `data/*.json` and `public/uploads/*`)
- **Vercel KV** for JSON data in production (videos, config)
- **Vercel Blob Storage** for binary files in production (uploaded videos, thumbnails)

## Setup Instructions

### Option 1: Vercel Storage (Recommended for Production)

#### A. Vercel KV for JSON Data (videos.json, config.json)

1. **Create a Vercel KV Database:**
   - Go to your Vercel dashboard
   - Navigate to your project
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "KV" (Key-Value store)
   - Create the database

2. **Get Environment Variables:**
   - After creating the KV database, Vercel will automatically add these to your project:
     - `KV_URL`
     - `KV_REST_API_TOKEN`

#### B. Vercel Blob Storage for Files (uploaded videos, thumbnails)

1. **Create a Vercel Blob Store:**
   - Go to your Vercel dashboard
   - Navigate to your project
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Blob"
   - Create the blob store

2. **Get Environment Variable:**
   - After creating the Blob store, Vercel will automatically add:
     - `BLOB_READ_WRITE_TOKEN`

3. **Install Package:**
   ```bash
   npm install @vercel/blob
   ```

4. **Redeploy:**
   - The environment variables will be available on your next deployment
   - No code changes needed - the app automatically detects and uses the appropriate storage

### Option 2: Local Development

For local development (`npm run dev`), file storage works automatically. The app will:
- Write to `data/videos.json` and `data/config.json` directly
- Save uploaded files to `public/uploads/videos/` and `public/uploads/thumbnails/`
- No additional setup required

### Option 3: Force File Storage

If you want to force file storage even in production (not recommended), you can set:
```bash
USE_FILE_STORAGE=true
```

But this will only work if your deployment environment allows file writes.

## How It Works

### JSON Data (videos.json, config.json)
- **Local:** Writes directly to `data/*.json` files
- **Production:** Stores in Vercel KV with keys `videos` and `config`

### Binary Files (uploaded videos, thumbnails)
- **Local:** Saves to `public/uploads/videos/` and `public/uploads/thumbnails/`
- **Production:** Uploads to Vercel Blob Storage, returns public URLs

## Migration

If you're migrating from file storage to KV/Blob:

1. The app will automatically read from files initially
2. When you save via the admin panel:
   - JSON data goes to KV (if configured)
   - Files go to Blob Storage (if configured)
3. Subsequent reads will come from KV/Blob

## Troubleshooting

### Error: "EROFS: read-only file system"
- This means you're in a serverless environment without storage configured
- Set up Vercel KV and Blob Storage (see Option 1 above)

### Error: "KV storage is not configured"
- Set `KV_URL` and `KV_REST_API_TOKEN` environment variables
- For Vercel: These are automatically added when you create a KV database
- For other platforms: You need to set them manually

### Error: "Cannot upload files in serverless environment"
- Set `BLOB_READ_WRITE_TOKEN` environment variable
- For Vercel: This is automatically added when you create a Blob store
- Install `@vercel/blob` package: `npm install @vercel/blob`

