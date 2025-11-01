import { NextRequest, NextResponse } from 'next/server';
import { readData, saveData } from '@/lib/storage';

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
    const body = await request.json();
    const { videos, walletAddress } = body;

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

    // Validate videos data
    if (!Array.isArray(videos)) {
      return NextResponse.json(
        { error: 'Videos must be an array' },
        { status: 400 }
      );
    }

    // Prepare videos data (remove type field for backward compatibility)
    const videosData = {
      videos: videos.map(({ type, ...video }: any) => video),
    };

    // Save using storage utility (uses Blob when configured)
    try {
      await saveData('videos', videosData);
    } catch (storageError: any) {
      // If it's a read-only filesystem error, provide helpful guidance
      if (storageError?.code === 'EROFS' || storageError?.message?.includes('read-only')) {
        return NextResponse.json(
          { 
            error: 'Cannot write to filesystem in serverless environment. ' +
                   'Please configure Vercel Blob storage by setting BLOB_READ_WRITE_TOKEN environment variable.',
            code: 'EROFS'
          },
          { status: 500 }
        );
      }
      throw storageError;
    }

    return NextResponse.json({
      success: true,
      message: 'Videos updated successfully',
    });
  } catch (error) {
    console.error('Error saving videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to save videos: ${errorMessage}` },
      { status: 500 }
    );
  }
}

