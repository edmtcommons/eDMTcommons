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
    const { config: newConfig, walletAddress } = body;

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

    // Validate config data
    if (!newConfig || typeof newConfig !== 'object') {
      return NextResponse.json(
        { error: 'Invalid config data' },
        { status: 400 }
      );
    }

    // Read current config to preserve adminWhitelist
    const currentConfig = await readData('config');

    // Merge with existing config to preserve adminWhitelist
    const updatedConfig = {
      ...currentConfig,
      ...newConfig,
      adminWhitelist: currentConfig.adminWhitelist, // Always preserve whitelist
    };

    // Save using storage utility (uses Blob when configured)
    try {
      await saveData('config', updatedConfig);
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
      message: 'Config updated successfully',
    });
  } catch (error) {
    console.error('Error saving config:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to save config: ${errorMessage}` },
      { status: 500 }
    );
  }
}

