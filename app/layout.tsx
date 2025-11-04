import type { Metadata } from 'next';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
import configData from '@/config.json';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { AppWrapper } from '@/components/AppWrapper';

export const metadata: Metadata = {
  title: 'eDMT Commons',
  description: 'Explore the eDMT Commons',
  keywords: ['eDMT', 'token', 'gallery', 'blockchain', 'Base', 'crypto', 'NFT', 'token-gated'],
  authors: [{ name: 'PsyDAO' }],
  creator: 'PsyDAO',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'eDMT Commons',
    description: 'Explore the eDMT Commons',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'eDMT Commons',
    images: [
      {
        url: '/assets/og.png',
        width: 1200,
        height: 630,
        alt: 'eDMT Commons',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eDMT Commons',
    description: 'Explore the eDMT Commons',
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
    icon: [
      { url: '/assets/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon.png', type: 'image/png' },
    ],
    apple: '/assets/favicon.png',
    shortcut: '/assets/favicon.ico',
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
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
        <link rel="icon" type="image/png" href="/assets/favicon.png" />
        <link rel="shortcut icon" type="image/x-icon" href="/assets/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />
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
              <ConditionalFooter />
            </div>
          </AppWrapper>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}


