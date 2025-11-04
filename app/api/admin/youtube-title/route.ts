import { NextRequest, NextResponse } from 'next/server';

// Mark as dynamic since we use searchParams
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Fetch title from YouTube oEmbed API
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oEmbedUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video information from YouTube' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      title: data.title || null,
      thumbnail: data.thumbnail_url || null,
      author: data.author_name || null,
    });
  } catch (error) {
    console.error('Error fetching YouTube title:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube video information' },
      { status: 500 }
    );
  }
}

