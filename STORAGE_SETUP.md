# Storage Setup Guide

## Problem

In serverless environments (like Vercel), the filesystem is read-only, which prevents writing to JSON files and uploading video/image files directly. This application uses a hybrid storage approach that works in both local development and production.

## Solution

The app automatically detects the environment and uses:
- **File storage** for local development (writes to `data/config.json` and `public/uploads/*`)
- **Vercel Blob Storage** for videos data and binary files in production (uploaded videos, thumbnails)

Note: `config.json` is always stored in the filesystem and version-controlled. Videos data is stored in Vercel Blob Storage.

## Setup Instructions

### Option 1: Vercel Storage (Recommended for Production)

#### A. Vercel Blob Storage for Videos Data and Files (uploaded videos, thumbnails)

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

4. **Set Environment Variable Locally:**
   - Create a `.env.local` file in your project root
   - Add: `BLOB_READ_WRITE_TOKEN=your_token_here`

5. **Redeploy:**
   - The environment variables will be available on your next deployment
   - No code changes needed - the app automatically detects and uses the appropriate storage

### Option 2: Local Development

For local development (`npm run dev`), the app will:
- Read/write `config.json` from `data/config.json` (version-controlled)
- Read/write videos data from Vercel Blob Storage (if `BLOB_READ_WRITE_TOKEN` is set) or fall back to file system
- Save uploaded files to `public/uploads/videos/` and `public/uploads/thumbnails/` (local) or Blob Storage (if configured)
- No additional setup required if using file storage fallback

### Option 3: Force File Storage

If you want to force file storage even in production (not recommended), you can set:
```bash
USE_FILE_STORAGE=true
```

But this will only work if your deployment environment allows file writes.

## How It Works

### Videos Data
- **Local/Production:** Stored in Vercel Blob Storage when `BLOB_READ_WRITE_TOKEN` is configured
- **Local Fallback:** Falls back to file system storage if Blob is not configured

### Config Data (config.json)
- **Always:** Stored in `data/config.json` (version-controlled, never in Blob)
- **Note:** Config cannot be modified via the admin panel in serverless environments

### Binary Files (uploaded videos, thumbnails)
- **Local:** Saves to `public/uploads/videos/` and `public/uploads/thumbnails/`
- **Production:** Uploads to Vercel Blob Storage, returns public URLs

## Migration

If you're migrating from file storage to Blob:

1. The app will automatically read from files initially (if Blob is not configured)
2. When you save via the admin panel:
   - Videos data goes to Blob Storage (if configured)
   - Files go to Blob Storage (if configured)
3. Subsequent reads will come from Blob Storage
4. Config always remains in the filesystem (`data/config.json`)

## Troubleshooting

### Error: "EROFS: read-only file system"
- This means you're in a serverless environment without storage configured
- Set up Vercel KV and Blob Storage (see Option 1 above)

### Error: "Cannot upload files in serverless environment"
- Set `BLOB_READ_WRITE_TOKEN` environment variable
- For Vercel: This is automatically added when you create a Blob store
- Install `@vercel/blob` package: `npm install @vercel/blob`

