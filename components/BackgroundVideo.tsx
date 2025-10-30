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
  const minimumLoadTime = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasNotifiedLoaded.current) return;

    // Ensure video is configured for autoplay
    video.muted = true;
    video.volume = 0;
    video.playsInline = true;

    // Mark video as loaded when it's actually playing
    const markAsLoaded = () => {
      // Wait for minimum load time (ensures loading screen is visible)
      if (!minimumLoadTime.current) {
        setTimeout(() => {
          minimumLoadTime.current = true;
          if (!hasNotifiedLoaded.current) {
            hasNotifiedLoaded.current = true;
            setVideoLoaded(true);
          }
        }, 1500); // Minimum 1.5 seconds for loading screen
      } else if (!hasNotifiedLoaded.current) {
        hasNotifiedLoaded.current = true;
        setVideoLoaded(true);
      }
    };

    // Function to attempt playing the video
    const attemptPlay = async () => {
      if (!video || hasNotifiedLoaded.current) return;
      
      // Ensure video is muted (required for autoplay)
      video.muted = true;
      video.volume = 0;
      
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          // Video is playing - mark as loaded after minimum time
          markAsLoaded();
        }
      } catch (error) {
        // Autoplay was prevented - still mark as loaded after minimum time
        console.log('Video autoplay prevented, will play on interaction');
        markAsLoaded();
      }
    };

    // Event handlers
    const handleCanPlay = () => {
      attemptPlay();
    };

    const handleCanPlayThrough = () => {
      attemptPlay();
    };

    const handleLoadedData = () => {
      attemptPlay();
    };

    const handlePlaying = () => {
      // Video is actually playing - mark as loaded
      markAsLoaded();
    };

    const handleError = () => {
      // Even if video fails, show content after minimum time
      markAsLoaded();
    };

    // Check if video is already ready
    if (video.readyState >= 3) {
      attemptPlay();
    }

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    // Try to play immediately
    attemptPlay();

    // Fallback: mark as loaded after 3 seconds maximum even if video hasn't loaded
    const fallbackTimeout = setTimeout(() => {
      markAsLoaded();
    }, 3000);

    // Cleanup
    return () => {
      clearTimeout(fallbackTimeout);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
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

