'use client';

import { useVideoLoader } from '@/lib/video-loader';
import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  className?: string;
  containerClassName?: string;
}

export function BackgroundVideo({
  className = 'w-full h-full object-center object-cover',
  containerClassName = 'absolute inset-0 z-0',
}: BackgroundVideoProps) {
  const { setVideoLoaded } = useVideoLoader();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasLoaded.current) return;

    // Set up event listeners
    const handleCanPlay = () => {
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        setVideoLoaded(true);
        // Ensure video plays
        video.play().catch((error) => {
          console.log('Video autoplay failed:', error);
        });
      }
    };

    const handleLoadedData = () => {
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        setVideoLoaded(true);
        // Ensure video plays
        video.play().catch((error) => {
          console.log('Video autoplay failed:', error);
        });
      }
    };

    const handleError = () => {
      // Even if video fails, show content
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        setVideoLoaded(true);
      }
    };

    // Check if video is already ready
    if (video.readyState >= 3) {
      hasLoaded.current = true;
      setVideoLoaded(true);
      video.play().catch((error) => {
        console.log('Video autoplay failed:', error);
      });
      return;
    }

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Try to play immediately
    video.play().catch((error) => {
      console.log('Video autoplay failed:', error);
    });

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [setVideoLoaded]);

  // Ensure video keeps playing if it pauses
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => {
      if (hasLoaded.current && video.paused) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div className={containerClassName}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={className}
      >
        <source src="/assets/bg-video.webm" type="video/webm" />
        <source src="/assets/bg-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

