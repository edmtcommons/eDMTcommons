'use client';

import { useVideoLoader } from '@/lib/video-loader';
import { LoadingScreen } from './LoadingScreen';
import { BackgroundVideo } from './BackgroundVideo';
import { useEffect, useState } from 'react';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isVideoLoaded } = useVideoLoader();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVideoLoaded) {
      // Show content after video is loaded
      setShowContent(true);
    }
  }, [isVideoLoaded]);

  return (
    <>
      {/* Background Video - persistent across all pages */}
      <BackgroundVideo containerClassName="fixed inset-0 z-0" />
      
      {/* Loading Screen - shown while video is loading */}
      {!isVideoLoaded && <LoadingScreen />}
      
      {/* Main Content - fades in after video loads */}
      <div
        className={`transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          visibility: showContent ? 'visible' : 'hidden',
          pointerEvents: showContent ? 'auto' : 'none'
        }}
      >
        {children}
      </div>
    </>
  );
}

