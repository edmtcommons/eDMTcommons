import lifiConfigJson from '@/data/lifi-config.json';

/**
 * LiFi Widget configuration loaded from JSON
 * The widget automatically integrates with wagmi/RainbowKit for wallet management
 * 
 * @see https://docs.li.fi/widget/configure-widget
 * 
 * IMPORTANT: This exports the entire JSON config exactly as it appears in lifi-config.json.
 * All properties including theme, subvariantOptions, variant, subvariant, and appearance
 * are passed directly to the widget.
 */
export const lifiConfig = {
  ...lifiConfigJson,
};

