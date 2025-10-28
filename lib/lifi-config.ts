import lifiConfigJson from '@/data/lifi-config.json';

/**
 * LiFi Widget configuration loaded from JSON
 * The widget automatically integrates with wagmi/RainbowKit for wallet management
 * 
 * @see https://docs.li.fi/widget/configure-widget
 */
export const lifiConfig = {
  ...lifiConfigJson,
  appearance: lifiConfigJson.appearance as 'light',
  variant: lifiConfigJson.variant as 'compact',
  subvariant: lifiConfigJson.subvariant as 'split',
  subvariantOptions: lifiConfigJson.subvariantOptions as {
    split: 'swap'
  },
};

