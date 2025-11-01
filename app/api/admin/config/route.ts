import { NextRequest, NextResponse } from 'next/server';
import { readData, saveData } from '@/lib/storage';

async function verifyAdmin(walletAddress: string): Promise<boolean> {
  try {
    const configData = await readData('config');
    
    if (!configData || !configData.adminWhitelist) {
      console.error('Config data is missing or adminWhitelist is not defined');
      return false;
    }
    
    const normalizedWhitelist = (configData.adminWhitelist || []).map((addr: string) =>
      addr.toLowerCase()
    );
    const normalizedAddress = walletAddress.toLowerCase();
    const isAuthorized = normalizedWhitelist.includes(normalizedAddress);
    
    if (!isAuthorized) {
      console.log(`Wallet ${normalizedAddress} not in whitelist. Whitelist contains:`, normalizedWhitelist);
    }
    
    return isAuthorized;
  } catch (error) {
    console.error('Error reading config for admin verification:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
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

    // Save using storage utility (config always saves to file system)
    try {
      await saveData('config', updatedConfig);
    } catch (storageError: any) {
      // If it's a read-only filesystem error or serverless environment, provide helpful guidance
      if (storageError?.code === 'EROFS' || storageError?.message?.includes('read-only') || storageError?.message?.includes('serverless')) {
        return NextResponse.json(
          { 
            error: 'Config cannot be saved in serverless environment. ' +
                   'Config.json is version-controlled and must be deployed with the application. ' +
                   'To update config, modify the file locally and redeploy.',
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

