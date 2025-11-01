'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { ADMIN_WHITELIST } from '@/lib/constants';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Normalize addresses for comparison (lowercase)
  const normalizedWhitelist = useMemo(
    () => ADMIN_WHITELIST.map((addr) => addr.toLowerCase()),
    []
  );

  const isAuthorized = useMemo(() => {
    if (!address) return false;
    return normalizedWhitelist.includes(address.toLowerCase());
  }, [address, normalizedWhitelist]);

  useEffect(() => {
    // If connected but not authorized, we'll show the access denied message
    // Don't redirect automatically, let the user see the message
  }, [isConnected, isAuthorized]);

  // Show connect wallet prompt when not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the admin panel. Only authorized wallet addresses can manage content.
          </p>
          <div className="flex justify-center">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                return (
                  <div {...(!mounted && { 'aria-hidden': true })}>
                    {(() => {
                      if (!mounted || !account || !chain) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl transition-colors font-medium text-lg"
                          >
                            Connect Wallet
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
    );
  }

  // Show access denied if wallet is connected but not in whitelist
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-2">
            Your wallet address is not authorized to access the admin panel.
          </p>
          <p className="text-gray-500 text-sm mb-6 font-mono break-all">
            {address}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // User is connected and authorized
  return <>{children}</>;
}

