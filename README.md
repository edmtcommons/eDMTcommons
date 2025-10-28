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
- **eDMT Token Contract**: Configured in `data/config.json`
- **Minimum Balance**: Configurable in `data/config.json` (default: 1000 eDMT tokens)

### Customizing the Token Gate Threshold

Edit `data/config.json` to change the minimum token balance required for gallery access:

```json
{
  "minimumTokenBalance": 1000,
  "tokenAddress": "0x7db6dfe35158bab10039648ce0e0e119d0ec21ec",
  "chainId": 8453,
  "chainName": "Base"
}
```

You can also use the admin interface at `/admin` to update the threshold and copy the updated JSON.

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/data` - Video metadata JSON file and gallery configuration
- `/public` - Static assets

## Managing Content

1. Visit `/admin` to access the management interface
2. **Update Token Threshold**: Change the minimum token balance in the configuration section
3. **Add Videos**: Add videos with title, URL, and optional thumbnail
4. Copy the generated JSON for either config or videos
5. Replace the contents of `data/config.json` or `data/videos.json` with the new JSON
6. Commit and push to GitHub

Changes to the configuration will automatically update throughout the application:
- Token gate logic uses the new threshold
- Access denied messages show the correct required amount
- Admin interface displays the current threshold

## Deployment

This project is configured for Vercel deployment:

1. Push to GitHub
2. Import the repository in Vercel
3. Deploy

## License

See LICENSE file for details.
