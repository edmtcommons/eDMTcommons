# Setup Checklist

Use this checklist when deploying to a new Vercel account and GitHub repository.

## Pre-Deployment

- [ ] Fork/clone repository to your GitHub account
- [ ] Update `config.json` with your token contract address
- [ ] Update `config.json` with your admin wallet addresses
- [ ] Update `config.json` with your token name
- [ ] Update `config.json` with your chain configuration (if different from Base)
- [ ] Get WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
- [ ] Review and customize `data/lifi-config.json` if needed
- [ ] Replace logo files in `/public/assets/` if needed
- [ ] Replace `og.png` for social media previews
- [ ] Update metadata in `app/layout.tsx` (title, description) if needed

## Environment Variables Setup

### Local Development (.env.local)

- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_SITE_URL` (use `http://localhost:3000` for local)
- [ ] Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (your WalletConnect Project ID)
- [ ] Set `BLOB_READ_WRITE_TOKEN` (optional for local, required for production)

### Vercel Deployment

- [ ] Deploy project to Vercel
- [ ] Add `NEXT_PUBLIC_SITE_URL` environment variable (your Vercel deployment URL)
- [ ] Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` environment variable
- [ ] Create Vercel Blob store
- [ ] Verify `BLOB_READ_WRITE_TOKEN` is automatically added
- [ ] Redeploy after adding environment variables

## Post-Deployment

- [ ] Test wallet connection
- [ ] Test token swap functionality
- [ ] Test gallery access with token-gated content
- [ ] Test admin panel access with whitelisted wallet
- [ ] Verify video upload works
- [ ] Verify videos appear in gallery after upload
- [ ] Test on mobile devices
- [ ] Verify OpenGraph tags work (test with social media preview tools)

## Configuration Files to Review

- `config.json` - Token and admin configuration
- `data/lifi-config.json` - LiFi widget appearance
- `app/layout.tsx` - Metadata and SEO settings
- `tailwind.config.ts` - Theme colors and styling

## Important Notes

1. **Admin Whitelist**: Only wallets in `config.json` → `adminWhitelist` can access `/admin`
2. **Blob Storage**: Required for video uploads. Create in Vercel Dashboard > Storage
3. **WalletConnect**: Free to use, but requires account creation
4. **Environment Variables**: All `NEXT_PUBLIC_*` variables are exposed to client-side code
5. **Config.json**: Is version-controlled and committed to git (admin whitelist is public)

## Troubleshooting

If something doesn't work:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check browser console for errors
4. Verify `config.json` is valid JSON
5. Ensure Blob store is created and token is set
6. Verify wallet addresses in admin whitelist are correct

