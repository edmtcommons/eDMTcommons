'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import dynamic from 'next/dynamic';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20Abi } from 'viem';
import { EDMT_TOKEN_ADDRESS, TOKEN_NAME, GALLERY_CONFIG } from '@/lib/constants';
import { lifiConfig } from '@/lib/lifi-config';
import Image from 'next/image';
import Link from 'next/link';

// Dynamically import LiFi Widget to avoid SSR issues
const LiFiWidget = dynamic(
  () => import('@lifi/widget').then((mod) => mod.LiFiWidget),
  { ssr: false }
);

export default function SwapPage() {
  const { isConnected, address, chain } = useAccount();
  const router = useRouter();

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
    <main className="w-full min-h-screen overflow-hidden relative pb-24">

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        <div className="flex gap-6 md:gap-8 lg:gap-10 items-top justify-center max-w-[1474px] mx-auto flex-col md:flex-row">
          {/* Welcome Card */}
          <div className="bg-cream rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl w-full md:w-[800px] min-h-[570px] flex flex-col gap-8 md:gap-10 lg:gap-12">
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 items-start text-text-primary w-full">
              <h2 className="text-[32px] md:text-[40px] lg:text-[48px] font-serif leading-[1.1] w-full">
                Welcome inside
              </h2>
              <div className="font-mono font-medium text-[16px] md:text-[17px] lg:text-[18px] leading-[1.3] w-full">
                <p className="mb-0">
                  Your {TOKEN_NAME} balance is sufficient to join the private {TOKEN_NAME} community
                  channels and help us govern our research into this groundbreaking
                  field.
                </p>
                <p className="mb-0">&nbsp;</p>
                <p>Join us on this introspective journey using the links below.</p>
              </div>
            </div>

            {/* Balance and Telegram Section */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-start w-full">
              {/* Balance Display */}
              <div className="basis-0 border border-border border-solid rounded-lg p-3 md:p-4 flex gap-3 md:gap-4 items-center grow min-w-0 h-[56px] md:h-[72px]">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Image
                    src="/assets/avatar.png"
                    alt="Token"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex flex-col items-start leading-normal text-text-primary text-center whitespace-nowrap min-w-0">
                  <p className="font-mono font-normal text-[13px] md:text-[15px]">Your balance</p>
                  <p className="font-mono font-medium text-[20px] md:text-[22px] lg:text-[24px]">
                    {formattedBalance} {TOKEN_NAME}
                  </p>
                </div>
              </div>

              {/* Telegram Button */}
              <a
                href="https://t.me/+yLQbGyOEvY9iODRh"
                target="_blank"
                rel="noopener noreferrer"
                className="basis-0 bg-button flex gap-3 md:gap-4 grow h-[56px] md:h-[72px] items-center justify-center min-w-0 p-3 md:p-4 rounded-lg"
              >
                <img
                  src="/assets/telegram-icon.svg"
                  alt=""
                  className="w-[20px] h-[15px] md:w-[23.99px] md:h-[18.286px]"
                />
                <span className="font-mono font-semibold leading-normal text-text-button text-[16px] md:text-[18px] text-center whitespace-nowrap">
                  Join Telegram
                </span>
              </a>
            </div>

            {/* Explore Media Gallery Link */}
            <div className="flex gap-4 items-center justify-end w-full mt-auto">
              <img
                src="/assets/television-icon.svg"
                alt=""
                className="w-6 h-6"
              />
              <Link
                href="/gallery"
                className="font-mono font-medium leading-[1.3] text-[#7d4869] text-[16px] md:text-[18px] underline whitespace-nowrap hover:opacity-80 transition-opacity"
              >
                Explore eDMT Media Gallery
              </Link>
            </div>
          </div>

          {/* LiFi Widget - fills entire column */}
          <div className="widget-container lifi-widget-hide-wallet w-full md:w-[392px] bg-cream rounded-3xl pt-8 px-8 pb-2 shadow-2xl min-h-[570px] flex flex-col items-center gap-8 md:gap-10 lg:gap-12">
            <h2 className="text-[32px] md:text-[40px] lg:text-[48px] font-serif leading-[1.1] text-text-primary z-20 -mb-[60px] text-left w-full ml-3">
              Get eDMT
            </h2>
            <div className="w-full min-h-0 -mx-2 md:-mx-3 lg:-mx-4 flex justify-center">
              <LiFiWidget
                integrator={`${TOKEN_NAME}-Gallery`}
                config={{
                  ...lifiConfig,
                  fromChain: chain?.id ?? GALLERY_CONFIG.chainId,
                  toChain: GALLERY_CONFIG.chainId,
                  toToken: GALLERY_CONFIG.tokenAddress,
                } as any}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

