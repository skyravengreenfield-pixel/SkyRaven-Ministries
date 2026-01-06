# Deployment Guide

## GitHub Pages (Current Setup)

Your app is configured to automatically deploy to GitHub Pages whenever you push to the `main` branch.

### Setup Steps:

1. **Enable GitHub Pages**
   - Go to: Settings → Pages
   - Under "Build and deployment", set Source to: **GitHub Actions**
   
2. **Deployment**
   - Push to `main` branch: `git push origin main`
   - Workflow automatically builds and deploys
   - View status: Actions tab

3. **Your Site URL**
   - Primary: `https://skyravengreenfield-pixel.github.io/SkyRaven-Ministries/`
   - Custom domain: Configure in Settings → Pages (optional)

### Custom Domain (Optional)

To use a custom domain (e.g., `www.skyravenministries.org`):

1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS:
   - Add CNAME record: `www` → `skyravengreenfield-pixel.github.io`
   - Or A records pointing to GitHub's IPs
3. Enable custom domain in Settings → Pages

## Manual Deployment

### Build Locally
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Alternative: Vercel/Netlify

If you prefer Vercel or Netlify:

1. **Remove GitHub Pages workflow**
   ```bash
   rm .github/workflows/deploy.yml
   ```

2. **Update vite.config.ts** (set `base: '/'`)

3. **Connect on platform**
   - Vercel: Import GitHub repo at vercel.com
   - Netlify: Import GitHub repo at netlify.com
   - Both auto-detect Vite settings

## Troubleshooting

- **404 on GitHub Pages**: Ensure Pages is enabled with "GitHub Actions" source
- **Assets not loading**: Check `base` path in `vite.config.ts`
- **Build fails**: Run `npm ci` to ensure clean dependencies
