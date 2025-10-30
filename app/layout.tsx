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


