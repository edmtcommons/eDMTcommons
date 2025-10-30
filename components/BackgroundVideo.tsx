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
  const hasNotifiedLoaded = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasNotifiedLoaded.current) return;

    // Mark video as loaded when it can start playing
    const markAsLoaded = () => {
      if (!hasNotifiedLoaded.current) {
        hasNotifiedLoaded.current = true;
        setVideoLoaded(true);
      }
    };

    // Function to attempt playing the video
    const attemptPlay = async () => {
      if (!video) return;
      
      // Ensure video is muted (required for autoplay)
      video.muted = true;
      video.volume = 0;
      
      try {
        await video.play();
        markAsLoaded();
      } catch (error) {
        // Autoplay was prevented - mark as loaded anyway so content shows
        markAsLoaded();
      }
    };

    // Event handlers
    const handleCanPlay = () => {
      attemptPlay();
      markAsLoaded();
    };

    const handleLoadedData = () => {
      attemptPlay();
      markAsLoaded();
    };

    const handlePlaying = () => {
      markAsLoaded();
    };

    const handleError = () => {
      // Even if video fails, show content
      markAsLoaded();
    };

    // Check if video is already ready
    if (video.readyState >= 3) {
      attemptPlay();
      markAsLoaded();
    }

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    // Try to play immediately
    attemptPlay();

    // Fallback: mark as loaded after 2 seconds even if video hasn't loaded
    const fallbackTimeout = setTimeout(() => {
      markAsLoaded();
    }, 2000);

    // Cleanup
    return () => {
      clearTimeout(fallbackTimeout);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [setVideoLoaded]);

  // Handle user interaction to enable autoplay if it was blocked
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleUserInteraction = async () => {
      if (video.paused) {
        video.muted = true;
        video.volume = 0;
        try {
          await video.play();
        } catch (error) {
          // Ignore errors
        }
      }
    };

    // Listen for any user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
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

