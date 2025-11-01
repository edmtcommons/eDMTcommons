import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import configData from '@/data/config.json';

async function verifyAdmin(walletAddress: string): Promise<boolean> {
  const normalizedWhitelist = (configData.adminWhitelist || []).map((addr: string) =>
    addr.toLowerCase()
  );
  return normalizedWhitelist.includes(walletAddress.toLowerCase());
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', type === 'video' ? 'videos' : 'thumbnails');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadsDir, filename);

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${type === 'video' ? 'videos' : 'thumbnails'}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

