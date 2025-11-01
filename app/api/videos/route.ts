import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/storage';

// Disable caching for this route to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Check if force refresh is requested via query parameter
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    
    console.log('Fetching videos from storage...', forceRefresh ? '(force refresh)' : '');
    const videosData = await readData('videos', forceRefresh);
    console.log('Videos data retrieved:', videosData ? 'success' : 'empty', videosData?.videos?.length || 0, 'videos');
    
    // Ensure we return the data in the expected format
    if (videosData && videosData.videos) {
      return NextResponse.json(videosData);
    } else if (Array.isArray(videosData)) {
      // Handle case where videos array is returned directly
      return NextResponse.json({ videos: videosData });
    } else {
      // Return empty structure if no data
      return NextResponse.json({ videos: [] });
    }
  } catch (error) {
    console.error('Error reading videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: `Failed to read videos: ${errorMessage}`, videos: [] },
      { status: 500 }
    );
  }
}

