'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TokenGate } from '@/components/TokenGate';
import { VideoGallery } from '@/components/VideoGallery';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  addedDate: string;
  membersOnly: boolean;
  type?: 'youtube' | 'uploaded';
}

export default function GalleryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos from /api/videos...');
        const response = await fetch('/api/videos', {
          cache: 'no-store', // Prevent browser caching
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
        const data = await response.json();
        
        console.log('Videos API response:', { ok: response.ok, hasVideos: !!data.videos, videoCount: data.videos?.length, error: data.error });
        
        if (response.ok && data.videos) {
          setVideos(data.videos);
          console.log(`Loaded ${data.videos.length} videos`);
        } else {
          console.error('Failed to fetch videos:', data.error || 'Unknown error', data);
          // Fallback to empty array
          setVideos([]);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <main className="min-h-screen w-full overflow-hidden relative pb-24">
      {/* Background - Static images with overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/gallery-bg-1.jpg"
          alt=""
          className="absolute max-w-none object-center object-cover w-full h-full"
        />
        <div className="absolute bg-[rgba(18,49,56,0.8)] inset-0" />
      </div>
      
      <Header />
      <TokenGate>
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white text-lg">Loading videos...</div>
          </div>
        ) : (
          <VideoGallery videos={videos} />
        )}
      </TokenGate>
    </main>
  );
}

