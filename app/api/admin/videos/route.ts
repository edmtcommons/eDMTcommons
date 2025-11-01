import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
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

    // Write to videos.json
    const filePath = join(process.cwd(), 'data', 'videos.json');
    await writeFile(filePath, JSON.stringify(videosData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Videos updated successfully',
    });
  } catch (error) {
    console.error('Error saving videos:', error);
    return NextResponse.json(
      { error: 'Failed to save videos' },
      { status: 500 }
    );
  }
}

