'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  addedDate: string;
  membersOnly: boolean;
}

interface VideoGalleryProps {
  videos: Video[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openVideo = (video: Video, index: number) => {
    setSelectedVideo(video);
    setCurrentIndex(index);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const navigateVideo = (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % videos.length
        : (currentIndex - 1 + videos.length) % videos.length;
    setCurrentIndex(newIndex);
    setSelectedVideo(videos[newIndex]);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <>
      <div className="relative z-10 overflow-x-auto overflow-y-visible px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10">
        <div className="flex gap-6 md:gap-8 lg:gap-10 items-center justify-center min-w-max md:justify-start">
          {videos.map((video, index) => {
            // Determine card width - third card (index 2) is featured with 468px width
            const isFeatured = index === 2;
            const cardWidth = isFeatured 
              ? 'w-[280px] md:w-[350px] lg:w-[468px]' 
              : 'w-[280px] md:w-[320px] lg:w-[368px]';
            const imageHeight = isFeatured 
              ? 'h-[350px] md:h-[450px] lg:h-[598px]' 
              : 'h-[250px] md:h-[350px] lg:h-[442px]';
            const totalHeight = isFeatured 
              ? 'h-auto md:h-[450px] lg:h-[598px]' 
              : 'h-auto md:h-[350px] lg:h-[564px]';
            
            return (
              <div
                key={video.id}
                onClick={() => openVideo(video, index)}
                className={`flex flex-col gap-4 items-start relative shrink-0 ${cardWidth} ${totalHeight} cursor-pointer`}
              >
                {/* Video Thumbnail */}
                <div className={`relative ${imageHeight} rounded-[18px] w-full overflow-hidden`}>
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-center object-cover rounded-[18px]"
                      sizes="(max-width: 768px) 100vw, 368px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-[18px]">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white/50"
                      >
                        <path
                          d="M8 5V19L19 12L8 5Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  )}
                  
                  {/* Locked Video Overlay */}
                  {video.membersOnly && (
                    <div className="absolute inset-0 bg-[rgba(92,49,76,0.63)] rounded-[18px] flex items-center justify-center pointer-events-none">
                      <img
                        src="/assets/lock-icon.svg"
                        alt="Locked"
                        className="w-12 h-12"
                      />
                    </div>
                  )}
                </div>
                
                {/* Members Only Badge */}
                {video.membersOnly && (
                  <div className="bg-badge-bg border border-badge-border border-solid flex gap-2 items-center pl-1 pr-2 py-1 rounded-[24px]">
                    <img
                      src="/assets/seal-check-icon.svg"
                      alt=""
                      className="w-6 h-6"
                    />
                    <span className="font-mono font-medium leading-[1.3] text-badge-text text-[14px] whitespace-nowrap">
                      Members Only
                    </span>
                  </div>
                )}
                
                {/* Video Title */}
                <div className="flex gap-2 items-start w-full">
                  <p className={`basis-0 font-mono font-medium grow leading-[1.3] min-w-0 relative shrink-0 text-text-button text-[18px] ${isFeatured ? '' : 'w-full'}`}>
                    {video.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50">
          {/* Background - Static images with overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/assets/gallery-bg-1.jpg"
              alt=""
              className="absolute max-w-none object-center object-cover w-full h-full"
            />
            <div className="absolute bg-[rgba(18,49,56,0.8)] inset-0" />
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 flex items-center justify-between overflow-hidden px-[176px] py-10 md:px-4 lg:px-8 xl:px-[176px]">
            {/* Left Navigation */}
            {videos.length > 1 && (
              <button
                onClick={() => navigateVideo('prev')}
                className="relative shrink-0 w-12 h-12 flex items-center justify-center text-text-button hover:opacity-80 transition-opacity"
                aria-label="Previous video"
              >
                <img
                  src="/assets/caret-left-icon.svg"
                  alt=""
                  className="w-full h-full"
                />
              </button>
            )}
            
            {/* Center Video Area */}
            <div className="flex flex-col gap-4 items-start relative shrink-0">
              {/* Close Button */}
              <div className="flex gap-2 items-center justify-end w-full">
                <button
                  onClick={closeVideo}
                  className="relative shrink-0 w-12 h-12 flex items-center justify-center text-text-button hover:opacity-80 transition-opacity"
                  aria-label="Close video"
                >
                  <img
                    src="/assets/x-icon.svg"
                    alt=""
                    className="w-full h-full"
                  />
                </button>
              </div>
              
              {/* Video Player */}
              <div className="relative h-[400px] w-full md:h-[500px] lg:h-[678px] lg:w-[1231px] max-w-full overflow-hidden pointer-events-none">
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.url)}
                  className="absolute left-[-1.66%] w-[104.53%] h-[104.53%] top-[-2.26%]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {/* Video Info */}
              <div className="flex gap-4 items-center w-full">
                {selectedVideo.membersOnly && (
                  <div className="bg-badge-bg border border-badge-border border-solid flex gap-2 items-center pl-1 pr-2 py-1 rounded-[24px] shrink-0">
                    <img
                      src="/assets/seal-check-icon.svg"
                      alt=""
                      className="w-6 h-6"
                    />
                    <span className="font-mono font-medium leading-[1.3] text-badge-text text-[14px] whitespace-nowrap">
                      Members Only
                    </span>
                  </div>
                )}
                <div className="basis-0 flex gap-2 grow items-start min-w-0 relative shrink-0">
                  <p className="basis-0 font-mono font-medium grow leading-[1.3] min-w-0 relative shrink-0 text-text-button text-[18px]">
                    {selectedVideo.title}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Navigation */}
            {videos.length > 1 && (
              <button
                onClick={() => navigateVideo('next')}
                className="relative shrink-0 w-12 h-12 flex items-center justify-center text-text-button hover:opacity-80 transition-opacity"
                aria-label="Next video"
              >
                <img
                  src="/assets/caret-right-icon.svg"
                  alt=""
                  className="w-full h-full"
                />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

