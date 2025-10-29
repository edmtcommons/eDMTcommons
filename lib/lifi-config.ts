import lifiConfigJson from '@/data/lifi-config.json';

/**
 * LiFi Widget configuration loaded from JSON
 * The widget automatically integrates with wagmi/RainbowKit for wallet management
 * 
 * @see https://docs.li.fi/widget/configure-widget
 * @see https://docs.li.fi/widget/customize-widget
 * 
 * This config structure matches the LiFi Widget API from the documentation:
 * - theme.palette: Color palette (primary, secondary, background, text, grey)
 * - theme.shape: Border radius settings
 * - theme.typography: Font family
 * - theme.container: Container styling (boxShadow, borderRadius)
 * 
 * All properties from lifi-config.json are passed directly to the widget.
 */
export const lifiConfig = {
  variant: lifiConfigJson.variant,
  subvariant: lifiConfigJson.subvariant,
  appearance: lifiConfigJson.appearance,
  // Hide UI elements per LiFi documentation
  // https://docs.li.fi/widget/customize-widget#hidden-ui-elements
  hiddenUI: ['toAddress', 'walletMenu', 'poweredBy'],
  theme: {
    palette: lifiConfigJson.theme?.palette,
    shape: lifiConfigJson.theme?.shape,
    typography: lifiConfigJson.theme?.typography,
    container: lifiConfigJson.theme?.container,
  },
};

