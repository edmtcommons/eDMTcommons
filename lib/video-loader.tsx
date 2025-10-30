'use client';

import { createContext, useContext, useState, useRef, useCallback } from 'react';

interface VideoLoaderContextType {
  isVideoLoaded: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  setVideoLoaded: (loaded: boolean) => void;
  registerVideoRef: (ref: React.RefObject<HTMLVideoElement>) => void;
}

const VideoLoaderContext = createContext<VideoLoaderContextType | undefined>(
  undefined
);

export function VideoLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const setVideoLoaded = useCallback((loaded: boolean) => {
    setIsVideoLoaded(loaded);
  }, []);

  const registerVideoRef = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
    // Store the ref if needed, but mainly we'll use it from BackgroundVideo
  }, []);

  return (
    <VideoLoaderContext.Provider value={{ isVideoLoaded, videoRef, setVideoLoaded, registerVideoRef }}>
      {children}
    </VideoLoaderContext.Provider>
  );
}

export function useVideoLoader() {
  const context = useContext(VideoLoaderContext);
  if (context === undefined) {
    throw new Error('useVideoLoader must be used within a VideoLoaderProvider');
  }
  return context;
}

