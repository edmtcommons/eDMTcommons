import lifiConfigJson from '@/data/lifi-config.json';
import { WalletClient } from '@lifi/wallet-management';

// LiFi Widget configuration loaded from lifi-config.json
export const lifiConfig = {
  ...lifiConfigJson,
  appearance: lifiConfigJson.appearance as 'light' | 'dark',
  walletConfig: {
    onConnect: (walletClient?: WalletClient) => {
      // Handle wallet connection if needed
      if (walletClient) {
        console.log('Wallet connected:', walletClient);
      }
    },
  },
};

