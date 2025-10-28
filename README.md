# eDMT Gallery

A Next.js website for eDMT token holders featuring wallet connection, token swapping, and a token-gated media gallery.

## Features

- **Wallet Connection**: Connect Ethereum wallets using RainbowKit
- **Token Swap**: Swap tokens for eDMT using Li.Fi widget
- **Token-Gated Gallery**: Access exclusive media content with 1000+ eDMT tokens
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

- **RainbowKit Project ID**: `d06eb4d17620a3c3f24d2ca8c45d6b31`
- **eDMT Token Contract**: `0x7db6dfe35158bab10039648ce0e0e119d0ec21ec` (Base chain)
- **Minimum Balance**: 1000 eDMT tokens required for gallery access

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/data` - Video metadata JSON file
- `/public` - Static assets

## Managing Videos

1. Visit `/admin` to access the management interface
2. Add videos with title, URL, and optional thumbnail
3. Copy the generated JSON
4. Replace the contents of `data/videos.json` with the new JSON
5. Commit and push to GitHub

## Deployment

This project is configured for Vercel deployment:

1. Push to GitHub
2. Import the repository in Vercel
3. Deploy

## License

See LICENSE file for details.
