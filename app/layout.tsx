import type { Metadata } from 'next';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
import configData from '@/data/config.json';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from '@/components/Footer';
import { AppWrapper } from '@/components/AppWrapper';

export const metadata: Metadata = {
  title: `${configData.tokenName} Gallery`,
  description: `${configData.tokenName} token holder exclusive media gallery`,
  keywords: ['eDMT', 'token', 'gallery', 'blockchain', 'Base', 'crypto', 'NFT', 'token-gated'],
  authors: [{ name: 'PsyDAO' }],
  creator: 'PsyDAO',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://edmt.bio'),
  openGraph: {
    title: `${configData.tokenName} Gallery`,
    description: `${configData.tokenName} token holder exclusive media gallery`,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://edmt.bio',
    siteName: `${configData.tokenName} Gallery`,
    images: [
      {
        url: '/assets/og.png',
        width: 1200,
        height: 630,
        alt: `${configData.tokenName} Gallery`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${configData.tokenName} Gallery`,
    description: `${configData.tokenName} token holder exclusive media gallery`,
    images: ['/assets/og.png'],
    creator: '@psy_dao',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/eDMT-icon.svg',
    apple: '/assets/eDMT-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload background video for better caching */}
        <link rel="preload" href="/assets/bg-video.mp4" as="video" />
        <link rel="preload" href="/assets/bg-video.webm" as="video" />
      </head>
      <body>
        <Providers>
          <AppWrapper>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </div>
          </AppWrapper>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}


