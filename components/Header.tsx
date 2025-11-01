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
    <header className="w-full px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between bg-transparent z-20 relative">
      {/* Logo */}
      <Link href="/swap" className="flex items-center gap-2">
        <Image
          src="/assets/logo.svg"
          alt={TOKEN_NAME}
          width={202}
          height={64}
          className="h-[40px] md:h-[50px] lg:h-[64px] w-auto"
          priority
        />
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-4 md:gap-6 lg:gap-10">
        <Link
          href="/swap"
          className={`text-text-button font-mono font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] hover:opacity-80 transition-opacity whitespace-nowrap ${
            pathname === '/swap' ? 'font-semibold' : ''
          }`}
        >
          GET ${TOKEN_NAME}
        </Link>
        <Link
          href="/gallery"
          className={`text-text-button font-mono font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] hover:opacity-80 transition-opacity whitespace-nowrap ${
            pathname === '/gallery' ? 'font-semibold' : ''
          }`}
        >
          MEDIA
        </Link>

        {/* Wallet Display */}
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className="bg-[rgba(11,30,34,0.5)] border border-button border-solid rounded-[72px] px-3 md:px-4 py-3 md:py-4 flex items-center justify-center gap-2 mr-8">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/avatar.png"
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              {balanceLoading ? (
                <span className="text-text-button font-mono font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] whitespace-nowrap">Loading...</span>
              ) : (
                <span className="text-text-button font-mono font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] whitespace-nowrap">
                  {formattedBalance} {TOKEN_NAME}
                </span>
              )}
            </div>
            {pathname === '/admin' ? (
              <button
                onClick={handleDisconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-mono font-medium text-[14px] md:text-[16px] flex items-center gap-2"
                aria-label="Disconnect wallet"
              >
                <img
                  src="/assets/sign-out-icon.svg"
                  alt="Disconnect"
                  className="w-4 h-4 brightness-0 invert"
                />
                <span>Disconnect Wallet</span>
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="w-6 h-6 flex items-center justify-center text-text-button hover:opacity-80 transition-opacity"
                aria-label="Sign out"
              >
                <img
                  src="/assets/sign-out-icon.svg"
                  alt="Sign out"
                  className="w-6 h-6"
                />
              </button>
            )}
          </div>
        )}

        {!isConnected && (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-text-button hover:bg-white/20 transition-colors font-mono font-medium text-[18px]"
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

