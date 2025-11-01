import { NextRequest, NextResponse } from 'next/server';
import { readData, uploadFileToStorage } from '@/lib/storage';

async function verifyAdmin(walletAddress: string): Promise<boolean> {
  try {
    const configData = await readData('config');
    
    const normalizedWhitelist = (configData.adminWhitelist || []).map((addr: string) =>
      addr.toLowerCase()
    );
    return normalizedWhitelist.includes(walletAddress.toLowerCase());
  } catch (error) {
    console.error('Error reading config for admin verification:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const walletAddress = formData.get('walletAddress') as string;
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'video' or 'thumbnail'

    // Verify wallet address is provided
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 401 }
      );
    }

    // Verify wallet is in admin whitelist
    const isAuthorized = await verifyAdmin(walletAddress);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Wallet address not in admin whitelist' },
        { status: 403 }
      );
    }

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate type
    if (!type || (type !== 'video' && type !== 'thumbnail')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "video" or "thumbnail"' },
        { status: 400 }
      );
    }

    // Upload file using storage utility (handles both file and blob storage)
    try {
      const url = await uploadFileToStorage(file, type as 'video' | 'thumbnail');
      
      // Extract filename from URL for response
      const filename = url.split('/').pop() || `${Date.now()}-${file.name}`;

      return NextResponse.json({
        success: true,
        url: url,
        filename: filename,
      });
    } catch (storageError: any) {
      // If it's a read-only filesystem error, provide helpful guidance
      if (storageError?.code === 'EROFS' || storageError?.message?.includes('read-only')) {
        return NextResponse.json(
          { 
            error: 'Cannot upload files in serverless environment. ' +
                   'Please configure Vercel Blob Storage by setting BLOB_READ_WRITE_TOKEN environment variable, ' +
                   'or use local file storage in development mode.',
            code: 'EROFS'
          },
          { status: 500 }
        );
      }
      throw storageError;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to upload file: ${errorMessage}` },
      { status: 500 }
    );
  }
}

