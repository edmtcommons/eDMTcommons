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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if video is already cached/loaded
    if (video.readyState >= 3) {
      setVideoLoaded(true);
      return;
    }

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

    // Ensure video plays even if autoplay is blocked
    video.play().catch((error) => {
      console.log('Video autoplay failed:', error);
    });

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [setVideoLoaded]);

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

