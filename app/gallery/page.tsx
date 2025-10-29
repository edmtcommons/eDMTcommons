'use client';

import { Header } from '@/components/Header';
import { TokenGate } from '@/components/TokenGate';
import { VideoGallery } from '@/components/VideoGallery';
import videosData from '@/data/videos.json';

export default function GalleryPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden relative bg-gradient-to-b from-background-dark to-teal-950 pb-24">
      <Header />
      <TokenGate>
        <VideoGallery videos={videosData.videos} />
      </TokenGate>
    </main>
  );
}

