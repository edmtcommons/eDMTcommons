'use client';

import { useVideoLoader } from '@/lib/video-loader';
import { LoadingScreen } from './LoadingScreen';
import { BackgroundVideo } from './BackgroundVideo';
import { useEffect, useState } from 'react';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isVideoLoaded } = useVideoLoader();
  const [showContent, setShowContent] = useState(isVideoLoaded);

  useEffect(() => {
    if (isVideoLoaded) {
      // Small delay for fade transition
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVideoLoaded]);

  return (
    <>
      {/* Background Video - persistent across all pages */}
      <BackgroundVideo containerClassName="fixed inset-0 z-0" />
      {!isVideoLoaded && <LoadingScreen />}
      <div
        className={`transition-opacity duration-1000 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ visibility: showContent ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </>
  );
}

