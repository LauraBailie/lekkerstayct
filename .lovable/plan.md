
Add a `public/_redirects` file with a single SPA fallback rule so React Router deep links work when the app is hosted on Cloudflare Pages (or any Netlify-style static host).

## What gets added

**New file: `public/_redirects`**

```
/*    /index.html   200
```

That's the entire file — one line. Vite copies everything in `public/` straight into `dist/` at build time, so Cloudflare Pages will pick it up automatically on the next deploy.

## Why this is safe

- **No effect on Lovable hosting.** Lovable's `.lovable.app` and preview URLs handle SPA fallback at the infrastructure level and ignore `_redirects` files. The current `lekkerstayct.lovable.app` deployment keeps working exactly as it does now.
- **No app code touched.** No routes, components, router config, or build settings change.
- **Fixes Cloudflare deep-link 404s.** Without this file, refreshing `/area/sea-point` or `/fair-price` on Cloudflare returns a 404. With it, Cloudflare serves `index.html` and React Router takes over.

## After deploy

Once you push and Cloudflare rebuilds, test by visiting a deep link directly (e.g. `https://your-site.pages.dev/fair-price`) and hitting refresh — it should load the page instead of 404ing.
