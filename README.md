# eDMT Gallery

A Next.js website for eDMT token holders featuring wallet connection, token swapping, and a token-gated media gallery.

## Features

- **Wallet Connection**: Connect Ethereum wallets using RainbowKit
- **Token Swap**: Swap tokens for eDMT using Li.Fi widget
- **Token-Gated Gallery**: Access exclusive media content (minimum token balance configurable)
- **Admin Interface**: Manage video gallery content through GitHub

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- RainbowKit for wallet connection
- Wagmi/Viem for blockchain interactions
- Li.Fi Widget for token swapping

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Environment Variables

Create a `.env.local` file (see `.env.example` for template) with:

- **NEXT_PUBLIC_SITE_URL**: Your site's public URL (e.g., `https://your-domain.vercel.app`)
- **NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID**: WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
- **BLOB_READ_WRITE_TOKEN**: Vercel Blob Storage token (auto-set when creating Blob store in Vercel)

### Application Configuration

- **Token Contract**: Configured in `config.json`
- **Minimum Balance**: Configurable in `config.json` (default: 1 token)
- **LiFi Widget Config**: Configured in `data/lifi-config.json`
- **Admin Whitelist**: Configured in `config.json` (wallet addresses that can access `/admin`)

### Customizing the Token Gate Threshold

Edit `config.json` to change the minimum token balance required for gallery access and configure token/chain settings:

```json
{
  "minimumTokenBalance": 1,
  "tokenName": "eDMT",
  "tokenAddress": "0x7db6dfe35158bab10039648ce0e0e119d0ec21ec",
  "chainId": 8453,
  "chainName": "Base"
}
```

Configuration fields:
- **minimumTokenBalance**: Minimum number of tokens required to access the gallery
- **tokenName**: Display name of the token (e.g., "eDMT")
- **tokenAddress**: Contract address of the token
- **chainId**: Blockchain network ID (8453 for Base)
- **chainName**: Display name of the blockchain network

You can also use the admin interface at `/admin` to update the threshold and copy the updated JSON.

### Customizing the LiFi Widget

The LiFi widget configuration is managed in `data/lifi-config.json`. This allows you to customize:

- **Variant**: Widget layout style (`compact`, `wide`, or `drawer`)
- **Subvariant**: Workflow type (`default`, `split`, or `custom`)
- **Subvariant Options**: For split subvariant, choose `swap` or `bridge` only
- **Appearance**: Light or dark theme
- **Theme**: Custom colors, typography, and styling

Example configuration:

```json
{
  "variant": "compact",
  "subvariant": "split",
  "subvariantOptions": {
    "split": "swap"
  },
  "appearance": "light",
  "theme": {
    "colorSchemes": {
      "light": {
        "palette": {
          "primary": { "main": "#5c314c" },
          "secondary": { "main": "#5c314c" }
        }
      }
    },
    "typography": {
      "fontFamily": "Roboto Mono, monospace"
    }
  }
}
```

**Wallet Integration**: The LiFi widget automatically integrates with RainbowKit's wallet connection. No additional wallet configuration is needed. The widget will use the wallet connected via RainbowKit for all transactions.

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
  - `lifi-config.ts` - LiFi widget configuration loader
  - `wagmi.ts` - Wagmi/RainbowKit configuration
  - `constants.ts` - Application constants
- `/data` - Configuration files
  - `lifi-config.json` - LiFi widget appearance and behavior settings
  - Note: Videos data is stored in Vercel Blob Storage, not in the filesystem
- `/public` - Static assets
- `config.json` - Token gate and token contract configuration (version-controlled)
- `.env.example` - Template for environment variables
- `DEPLOYMENT.md` - Complete deployment guide
- `SETUP_CHECKLIST.md` - Setup checklist for new deployments

## Files to Update for New Deployment

When deploying to a new account:

1. **`config.json`** - Update token address, admin whitelist, token name
2. **`.env.local`** (create from `.env.example`) - Set environment variables
3. **`app/layout.tsx`** - Update metadata (title, description) if needed
4. **`/public/assets/`** - Replace logos and branding assets
5. **`data/lifi-config.json`** - Customize widget appearance if needed

## Managing Content

1. Visit `/admin` to access the management interface (requires whitelisted wallet address)
2. **Add Videos**: Add YouTube videos or upload video files with title, thumbnail, and members-only settings
3. **Reorder Videos**: Drag and drop or use arrow buttons to reorder videos
4. **Delete Videos**: Remove videos from the gallery
5. Click "Save Changes" to persist all modifications to Vercel Blob Storage

Changes are saved automatically to Vercel Blob Storage:
- Videos are stored in Blob Storage (not in the codebase)
- Config settings remain in `config.json` (version-controlled)
- The gallery page automatically fetches the latest videos from Blob Storage
- LiFi widget reflects theme and appearance changes

## Deployment

This project is configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Start

1. **Fork/Clone** this repository to your GitHub account
2. **Configure** `config.json` with your token and admin addresses
3. **Set up** environment variables (see `.env.example`)
4. **Deploy** to Vercel and connect your GitHub repository
5. **Create** a Vercel Blob store for video storage
6. **Test** the deployment

For complete step-by-step instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## License

See LICENSE file for details.
