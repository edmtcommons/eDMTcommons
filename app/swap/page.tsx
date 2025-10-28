'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import dynamic from 'next/dynamic';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20Abi } from 'viem';
import { EDMT_TOKEN_ADDRESS } from '@/lib/constants';

// Dynamically import Li.Fi Widget to avoid SSR issues
const LiFiWidget = dynamic(
  () => import('@lifi/widget').then((mod) => mod.LiFiWidget),
  {
    ssr: false,
  }
);

export default function SwapPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const { address } = useAccount();

  const { data: balance } = useReadContract({
    address: EDMT_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { data: decimals } = useReadContract({
    address: EDMT_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  const formattedBalance =
    balance && decimals
      ? parseFloat(formatUnits(balance, decimals)).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '0.00';

  return (
    <main className="min-h-screen w-full overflow-hidden relative">
      {/* Background */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900 via-blue-900 to-teal-900" />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-cream rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-serif text-primary mb-6">
              Welcome inside
            </h2>
            <p className="text-primary/80 mb-4 leading-relaxed">
              Your eDMT balance is sufficient to join the private eDMT community
              channels and help us govern our research into this groundbreaking
              field.
            </p>
            <p className="text-primary/80 mb-8 leading-relaxed">
              Join us on this introspective journey using the links below.
            </p>

            {/* Balance Display */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6C9 6 7 8 7 11C7 14 9 16 12 16C15 16 17 14 17 11C17 8 15 6 12 6ZM12 14C10.35 14 9 12.65 9 11C9 9.35 10.35 8 12 8C13.65 8 15 9.35 15 11C15 12.65 13.65 14 12 14Z"
                      fill="white"
                    />
                    <rect
                      x="11"
                      y="15"
                      width="2"
                      height="6"
                      rx="1"
                      fill="white"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-primary/60 text-sm">Your balance</p>
                  <p className="text-primary text-2xl font-bold">
                    {formattedBalance} eDMT
                  </p>
                </div>
              </div>
            </div>

            {/* Telegram Button */}
            <a
              href="https://t.me/edmt"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <span>💬</span>
              Join Telegram
            </a>
          </div>

          {/* Swap Card */}
          <div className="bg-cream rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Swap eDMT
            </h2>
            <div className="widget-container">
              <LiFiWidget
                integrator="eDMT-Gallery"
                config={{
                  variant: 'compact' as any,
                  subvariant: 'split' as any,
                  appearance: 'light' as any,
                  theme: {
                    // @ts-ignore - Li.Fi widget theme config
                    colorSchemes: {
                      light: {
                        palette: {
                          primary: {
                            main: '#5c314c',
                          },
                          secondary: {
                            main: '#5c314c',
                          },
                          background: {
                            default: '#e9e6d6',
                            paper: '#e9e6d6',
                          },
                          grey: {
                            200: '#bfbcad',
                            300: '#bfbcad',
                          },
                          text: {
                            primary: '#123138',
                          },
                        },
                      },
                    },
                    typography: {
                      fontFamily: 'Roboto Mono, monospace',
                    },
                    container: {
                      boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
                      borderRadius: '16px',
                    },
                    shape: {
                      borderRadiusSecondary: 8,
                      borderRadius: 8,
                    },
                  },
                  toChain: 8453, // Base chain
                  toToken: '0x7db6dfe35158bab10039648ce0e0e119d0ec21ec', // eDMT address
                } as any}
              />
              <p className="text-primary/60 text-xs mt-4 text-center">
                Powered by LI.FI
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

