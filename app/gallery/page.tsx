'use client';

import { Header } from '@/components/Header';
import { TokenGate } from '@/components/TokenGate';
import { VideoGallery } from '@/components/VideoGallery';
import videosData from '@/data/videos.json';

export default function GalleryPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden relative pb-24">
      {/* Background - Static images with overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/gallery-bg-1.png"
          alt=""
          className="absolute max-w-none object-center object-cover w-full h-full"
        />
        <img
          src="/assets/gallery-bg-2.png"
          alt=""
          className="absolute max-w-none object-center object-cover w-full h-full"
        />
        <div className="absolute bg-[rgba(18,49,56,0.8)] inset-0" />
      </div>
      
      <Header />
      <TokenGate>
        <VideoGallery videos={videosData.videos} />
      </TokenGate>
    </main>
  );
}

