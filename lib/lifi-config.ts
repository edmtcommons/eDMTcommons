import lifiConfigJson from '@/data/lifi-config.json';

// LiFi Widget configuration loaded from lifi-config.json
// The wallet connection will be handled by RainbowKit/wagmi automatically
export const lifiConfig = {
  ...lifiConfigJson,
  appearance: lifiConfigJson.appearance as 'light' | 'dark',
};

