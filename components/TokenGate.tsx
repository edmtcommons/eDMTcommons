'use client';

import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20Abi } from 'viem';
import { EDMT_TOKEN_ADDRESS, EDMT_MIN_BALANCE, GALLERY_CONFIG } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface TokenGateProps {
  children: React.ReactNode;
}

export function TokenGate({ children }: TokenGateProps) {
  const { address, isConnected } = useAccount();
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

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected || balanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!balance || !decimals) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80 mb-6">
            Unable to verify your eDMT balance. Please try again.
          </p>
          <button
            onClick={() => router.push('/swap')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-colors"
          >
            Get eDMT Tokens
          </button>
        </div>
      </div>
    );
  }

  const balanceBigInt = balance as bigint;
  const hasAccess = balanceBigInt >= EDMT_MIN_BALANCE;
  const formattedBalance = parseFloat(formatUnits(balanceBigInt, decimals));

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Insufficient eDMT Tokens
          </h2>
          <p className="text-white/80 mb-2">
            You need at least {GALLERY_CONFIG.minimumTokenBalance.toLocaleString()} eDMT tokens to access this content.
          </p>
          <p className="text-white/60 text-sm mb-6">
            Your current balance: {formattedBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} eDMT
          </p>
          <button
            onClick={() => router.push('/swap')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-colors"
          >
            Get More eDMT Tokens
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

