'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useDisconnect } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20Abi } from 'viem';
import { EDMT_TOKEN_ADDRESS, TOKEN_NAME } from '@/lib/constants';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const router = useRouter();

  const { data: balance, isLoading: balanceLoading } = useReadContract({
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

  const formattedBalance = balance && decimals
    ? parseFloat(formatUnits(balance, decimals)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00';

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-transparent z-20 relative">
      {/* Logo */}
      <Link href="/swap" className="flex items-center gap-2">
        <Image
          src="/assets/logo.svg"
          alt={TOKEN_NAME}
          width={200}
          height={53}
          className="w-[200px] h-auto"
          priority
        />
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        <Link
          href="/swap"
          className={`text-white hover:opacity-80 transition-opacity ${
            pathname === '/swap' ? 'font-semibold' : ''
          }`}
        >
          GET ${TOKEN_NAME}
        </Link>
        <Link
          href="/gallery"
          className={`text-white hover:opacity-80 transition-opacity ${
            pathname === '/gallery' ? 'font-semibold' : ''
          }`}
        >
          MEDIA
        </Link>

        {/* Wallet Display */}
        {isConnected && (
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 3.5C6.3 3.5 5.75 4.05 5.75 4.75C5.75 5.45 6.3 6 7 6C7.7 6 8.25 5.45 8.25 4.75C8.25 4.05 7.7 3.5 7 3.5ZM7 5.25C6.775 5.25 6.625 5.1 6.625 4.875C6.625 4.65 6.775 4.5 7 4.5C7.225 4.5 7.375 4.65 7.375 4.875C7.375 5.1 7.225 5.25 7 5.25Z"
                    fill="white"
                  />
                  <rect
                    x="6.125"
                    y="7.875"
                    width="1.75"
                    height="4.375"
                    rx="0.5"
                    fill="white"
                  />
                </svg>
              </div>
              {balanceLoading ? (
                <span className="text-white text-sm">Loading...</span>
              ) : (
                <span className="text-white text-sm font-medium">
                  {formattedBalance} {TOKEN_NAME}
                </span>
              )}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-8 h-8 flex items-center justify-center text-white hover:opacity-80 transition-opacity"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        {!isConnected && (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white hover:bg-white/20 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        )}
      </nav>
    </header>
  );
}

