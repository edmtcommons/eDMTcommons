import type { Metadata } from 'next';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
import configData from '@/data/config.json';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Footer } from '@/components/Footer';

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
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}


