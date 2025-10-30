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
  const playAttempted = useRef(false);

  // Function to attempt playing the video
  const attemptPlay = (video: HTMLVideoElement) => {
    if (playAttempted.current && !video.paused) return;
    
    // Ensure video is muted and volume is 0 (required for autoplay)
    video.muted = true;
    video.volume = 0;
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video is playing
          playAttempted.current = true;
          if (!hasLoaded.current) {
            hasLoaded.current = true;
            setVideoLoaded(true);
          }
        })
        .catch((error) => {
          // Autoplay was prevented, but we'll try again when user interacts
          console.log('Video autoplay prevented:', error);
          // Still mark as loaded so content shows
          if (!hasLoaded.current) {
            hasLoaded.current = true;
            setVideoLoaded(true);
          }
        });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is configured for autoplay
    video.muted = true;
    video.volume = 0;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    // Set up event listeners
    const handleCanPlay = () => {
      attemptPlay(video);
    };

    const handleLoadedData = () => {
      attemptPlay(video);
    };

    const handleLoadedMetadata = () => {
      attemptPlay(video);
    };

    const handleError = () => {
      // Even if video fails, show content
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        setVideoLoaded(true);
      }
    };

    // Check if video is already ready
    if (video.readyState >= 2) {
      attemptPlay(video);
    }

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    // Try to play immediately
    attemptPlay(video);

    // Also try after a short delay to catch edge cases
    const timeoutId = setTimeout(() => {
      attemptPlay(video);
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [setVideoLoaded]);

  // Ensure video keeps playing if it pauses
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => {
      if (hasLoaded.current && video.paused) {
        // Re-ensure muted before playing
        video.muted = true;
        video.volume = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Handle user interaction to enable autoplay if it was blocked
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleUserInteraction = () => {
      if (video.paused && hasLoaded.current) {
        video.muted = true;
        video.volume = 0;
        video.play().catch(() => {});
      }
    };

    // Listen for any user interaction on the document
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
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

