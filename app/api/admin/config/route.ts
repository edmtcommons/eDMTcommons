import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import configData from '@/data/config.json';

async function verifyAdmin(walletAddress: string): Promise<boolean> {
  const normalizedWhitelist = (configData.adminWhitelist || []).map((addr: string) =>
    addr.toLowerCase()
  );
  return normalizedWhitelist.includes(walletAddress.toLowerCase());
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

    // Merge with existing config to preserve adminWhitelist
    const updatedConfig = {
      ...configData,
      ...newConfig,
      adminWhitelist: configData.adminWhitelist, // Always preserve whitelist
    };

    // Write to config.json
    const filePath = join(process.cwd(), 'data', 'config.json');
    await writeFile(filePath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Config updated successfully',
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { error: 'Failed to save config' },
      { status: 500 }
    );
  }
}

