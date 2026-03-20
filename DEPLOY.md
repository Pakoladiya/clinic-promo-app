# Deploying ClinicPromo to Vercel

## One-click deploy

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import `Pakoladiya/clinic-promo-app` from GitHub
3. Set **Root Directory** to `web`
4. Vercel auto-detects Vite — leave framework as **Vite**
5. Add environment variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

6. Click **Deploy**

That's it. Vercel handles HTTPS, CDN, and service worker scope automatically.

---

## Subsequent deploys

Every push to `main` triggers an automatic redeploy via Vercel's GitHub integration.

---

## PWA install (after deploy)

On mobile (iOS Safari or Android Chrome):

- Open the deployed URL
- iOS: tap the **Share** button → **Add to Home Screen**
- Android: tap the browser menu → **Install App**

The app will open full-screen with no address bar, exactly like a native app.

---

## Custom domain (optional)

1. Vercel dashboard → your project → **Domains**
2. Add your domain (e.g. `app.yourclinic.com`)
3. Follow Vercel's DNS instructions (usually a CNAME record)
