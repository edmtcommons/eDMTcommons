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
  const { isVideoLoaded, setVideoLoaded } = useVideoLoader();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSetUpListeners = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // If video is already loaded from context, don't set up listeners again
    if (isVideoLoaded && hasSetUpListeners.current) {
      // Just ensure video is playing
      if (video.paused) {
        video.play().catch(() => {});
      }
      return;
    }

    // Check if video is already cached/loaded
    if (video.readyState >= 3) {
      setVideoLoaded(true);
      hasSetUpListeners.current = true;
      return;
    }

    // Only set up listeners once
    if (hasSetUpListeners.current) return;
    hasSetUpListeners.current = true;

    // Listen for when video can play through
    const handleCanPlayThrough = () => {
      setVideoLoaded(true);
    };

    const handleLoadedData = () => {
      // Video has loaded enough data to start playing
      setVideoLoaded(true);
    };

    const handleError = () => {
      // Even if video fails, show content
      setVideoLoaded(true);
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Only play if video is not already playing
    if (video.paused) {
      video.play().catch((error) => {
        console.log('Video autoplay failed:', error);
      });
    }

    return () => {
      // Don't remove listeners on unmount if video is loaded
      // This keeps the video playing across navigations
      if (!isVideoLoaded) {
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      }
    };
  }, [setVideoLoaded, isVideoLoaded]);

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

