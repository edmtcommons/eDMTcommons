# Deployment Guide

This guide will help you deploy this application to a new Vercel account connected to a different GitHub repository.

## Prerequisites

- A GitHub account
- A Vercel account
- Node.js 18+ installed locally (for testing)

## Step 1: Fork/Clone the Repository

1. Fork this repository to your GitHub account, or create a new repository and push this code
2. Clone your repository locally:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

## Step 2: Configure Environment Variables

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Site URL (used for OpenGraph metadata)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# WalletConnect Project ID (required for wallet connections)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Vercel Blob Storage Token (required for video uploads)
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

### Getting Your WalletConnect Project ID

1. Go to [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Add it to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Getting Your Vercel Blob Storage Token

1. Deploy your project to Vercel first (see Step 3)
2. Go to your Vercel project dashboard
3. Navigate to **Storage** tab
4. Click **Create Database** → Select **Blob**
5. Create the Blob store
6. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables
7. For local development, copy the token to your `.env.local` file

## Step 3: Configure Application Settings

### Update `config.json`

Edit `config.json` in the root directory to match your token and chain configuration:

```json
{
  "minimumTokenBalance": 1,
  "tokenName": "YOUR_TOKEN_NAME",
  "tokenAddress": "0xYOUR_TOKEN_ADDRESS",
  "chainId": 8453,
  "chainName": "Base",
  "adminWhitelist": [
    "0xYOUR_ADMIN_WALLET_ADDRESS_1",
    "0xYOUR_ADMIN_WALLET_ADDRESS_2"
  ]
}
```

**Important:**
- Update `tokenName` to your token's display name
- Update `tokenAddress` to your token's contract address
- Update `chainId` and `chainName` if using a different blockchain
- Add your admin wallet addresses to `adminWhitelist` (these wallets can access `/admin`)

### Update Metadata (Optional)

Edit `app/layout.tsx` to update:
- Site title
- OpenGraph description
- Twitter card information
- Favicon references (if using custom ones)

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in
3. Click **Add New Project**
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. **Configure Environment Variables:**
   - Add `NEXT_PUBLIC_SITE_URL` (will be auto-filled after first deployment)
   - Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - Add `BLOB_READ_WRITE_TOKEN` (after creating Blob store)
7. Click **Deploy**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

## Step 5: Set Up Vercel Blob Storage

After initial deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Blob**
5. Create the Blob store
6. Vercel will automatically add `BLOB_READ_WRITE_TOKEN`
7. Redeploy your application for the token to take effect

## Step 6: Test the Deployment

1. Visit your deployed site
2. Test wallet connection
3. Test token swap functionality
4. Test gallery access (requires token balance)
5. Test admin panel at `/admin` (requires whitelisted wallet)

## Step 7: Customize Content

### Update Branding

- Replace logo files in `/public/assets/`
- Update `og.png` for social media previews
- Update favicon files

### Add Initial Videos

1. Visit `/admin` with a whitelisted wallet
2. Add videos via the admin interface
3. Videos will be stored in Vercel Blob Storage

## Environment Variables Summary

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Your site's public URL | Your Vercel deployment URL |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect Project ID | [WalletConnect Cloud](https://cloud.walletconnect.com) |
| `BLOB_READ_WRITE_TOKEN` | Yes (for uploads) | Vercel Blob Storage token | Vercel Dashboard > Storage > Blob |

## Troubleshooting

### Videos not saving/showing

- Ensure `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables
- Ensure Blob store is created in Vercel
- Check Vercel deployment logs for errors
- Verify the token has read/write permissions

### Wallet connection not working

- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- Check that the Project ID is from an active WalletConnect project
- Ensure the variable starts with `NEXT_PUBLIC_` (required for client-side access)

### Admin panel access denied

- Verify your wallet address is in `config.json` → `adminWhitelist`
- Ensure you're using the correct wallet address (case-sensitive)
- Check that `config.json` is committed to your repository

### Build errors

- Ensure all environment variables are set in Vercel
- Check that `config.json` is valid JSON
- Verify all dependencies are installed (`npm install`)

## Local Development

For local development:

1. Copy `.env.example` to `.env.local`
2. Fill in the required values
3. Run `npm install`
4. Run `npm run dev`
5. Visit `http://localhost:3000`

**Note:** For local development, you can use file storage (no Blob token needed) or set up Blob storage for testing production-like behavior.

## Security Notes

- Never commit `.env.local` or `.env` files to git
- Keep your `BLOB_READ_WRITE_TOKEN` secret
- WalletConnect Project IDs can be public (they're in client-side code)
- Admin whitelist addresses in `config.json` are version-controlled (this is intentional for transparency)

## Support

For issues specific to:
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **RainbowKit**: Check [RainbowKit Documentation](https://www.rainbowkit.com/docs)
- **LiFi Widget**: Check [LiFi Documentation](https://docs.li.fi/widget)

