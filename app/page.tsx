'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TOKEN_NAME } from '@/lib/constants';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/swap');
    }
  }, [isConnected, router]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/bg-video.mp4" type="video/mp4" />
        </video>
        {/* Fallback gradient if video doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900 via-blue-900 to-teal-900" />
      </div>

      {/* Modal Card */}
      <div className="relative z-10 bg-cream w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8">
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 10C15 10 11 14 11 19C11 24 15 28 20 28C25 28 29 24 29 19C29 14 25 10 20 10ZM20 26C16.7 26 14 23.3 14 20C14 16.7 16.7 14 20 14C23.3 14 26 16.7 26 20C26 23.3 23.3 26 20 26Z"
                fill="currentColor"
                className="text-white"
              />
              <rect
                x="18"
                y="22"
                width="4"
                height="8"
                rx="1"
                fill="currentColor"
                className="text-white"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-serif text-primary text-center mb-4">
          Open The Door
        </h1>

        {/* Description */}
        <p className="text-sm text-primary mb-8 leading-relaxed">
          {TOKEN_NAME} is granting early membership to token holders. Sign in and
          connect your wallet to qualify.
        </p>

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
                          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15 10V6C15 4.89543 14.1046 4 13 4H4C2.89543 4 2 4.89543 2 6V14C2 15.1046 2.89543 16 4 16H9M15 10L12 7M15 10L12 13"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
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
    </main>
  );
}


