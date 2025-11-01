import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

async function verifyAdmin(walletAddress: string): Promise<boolean> {
  try {
    const configPath = join(process.cwd(), 'data', 'config.json');
    const configFile = await readFile(configPath, 'utf-8');
    const configData = JSON.parse(configFile);
    
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
    const configPath = join(process.cwd(), 'data', 'config.json');
    const configFile = await readFile(configPath, 'utf-8');
    const currentConfig = JSON.parse(configFile);

    // Merge with existing config to preserve adminWhitelist
    const updatedConfig = {
      ...currentConfig,
      ...newConfig,
      adminWhitelist: currentConfig.adminWhitelist, // Always preserve whitelist
    };

    // Write to config.json
    const jsonContent = JSON.stringify(updatedConfig, null, 2);
    await writeFile(configPath, jsonContent, 'utf-8');

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

