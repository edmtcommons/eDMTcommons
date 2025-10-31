'use client';

import { useVideoLoader } from '@/lib/video-loader';
import { LoadingScreen } from './LoadingScreen';
import { BackgroundVideo } from './BackgroundVideo';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isVideoLoaded } = useVideoLoader();
  const [showContent, setShowContent] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const pathname = usePathname();

  // Only show video on home and swap pages
  const shouldShowVideo = pathname === '/' || pathname === '/swap';

  useEffect(() => {
    if (shouldShowVideo) {
      // Only use video loading logic if video is enabled for this page
      if (isVideoLoaded) {
        // Hide loading screen and show content
        setShowLoading(false);
        // Small delay before showing content for smooth transition
        setTimeout(() => {
          setShowContent(true);
        }, 300);
      } else {
        // Video is still loading
        setShowLoading(true);
        setShowContent(false);
      }
    } else {
      // For pages without video, show content immediately
      setShowLoading(false);
      setShowContent(true);
    }
  }, [isVideoLoaded, shouldShowVideo, pathname]);

  return (
    <>
      {/* Background Video - only on home and swap pages */}
      {shouldShowVideo && <BackgroundVideo containerClassName="fixed inset-0 z-0" />}
      
      {/* Loading Screen - shown while video is loading (only on pages with video) */}
      {shouldShowVideo && showLoading && <LoadingScreen />}
      
      {/* Main Content - fades in after video loads (on video pages) or immediately (on other pages) */}
      <div
        className={`transition-opacity duration-700 ${
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

