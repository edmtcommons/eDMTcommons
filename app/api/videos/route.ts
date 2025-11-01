import { NextResponse } from 'next/server';
import { readData } from '@/lib/storage';

export async function GET() {
  try {
    const videosData = await readData('videos');
    
    return NextResponse.json(videosData);
  } catch (error) {
    console.error('Error reading videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to read videos: ${errorMessage}`, videos: [] },
      { status: 500 }
    );
  }
}

