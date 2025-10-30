'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TOKEN_NAME } from '@/lib/constants';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isConnected) {
      router.push('/swap');
    }
  }, [isConnected, router]);

  useEffect(() => {
    // Ensure video plays even if autoplay is blocked
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pb-24">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-center object-cover"
        >
          <source src="/assets/bg-video.webm" type="video/webm" />
          <source src="/assets/bg-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Modal Card */}
      <div className="relative z-10 bg-cream w-full max-w-[800px] mx-4 rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16">
        <div className="flex flex-col gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Logo Icon */}
          <div className="flex justify-center">
            <img
              src="/assets/eDMT-icon.svg"
              alt="eDMT Logo"
              className="h-[60px] w-auto md:h-[75px] lg:h-[90.854px] lg:w-[62.619px]"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 items-start text-text-primary w-full text-center">
            {/* Heading */}
            <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-serif leading-[1.1] w-full">
              Open The Door
            </h1>

            {/* Description */}
            <p className="text-[16px] md:text-[17px] lg:text-[18px] font-mono font-medium leading-[1.3] w-full">
              {TOKEN_NAME} is granting early membership to token holders. Sign in and connect your wallet to qualify.
            </p>
          </div>

          {/* Connect Button */}
          <div className="flex justify-center">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="bg-button hover:bg-button/90 text-text-button font-mono font-semibold text-[16px] md:text-[18px] h-[56px] md:h-[72px] rounded-lg px-2 py-2 flex items-center justify-center gap-2 transition-colors w-full md:w-[200px]"
                          >
                            <img
                              src="/assets/stairs-icon.svg"
                              alt=""
                              className="w-6 h-6"
                            />
                            Connect
                          </button>
                        );
                      }

                      return null;
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </main>
  );
}


