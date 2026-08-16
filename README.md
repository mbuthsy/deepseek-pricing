# DeepSeek Pricing Status

Live DeepSeek V4 peak / off-peak API pricing tracker. Displays current pricing (peak vs. off-peak), a countdown to the next rate change, and optional browser notifications when rates switch.

**Live site:** https://deepseek-pricing.pages.dev

## Features

- Real-time peak / off-peak badge with countdown to next change
- Current USD prices for `deepseek-v4-flash` and `deepseek-v4-pro`
- Browser notifications on each peak/off-peak switch
- Installable as a PWA (works offline via service worker)

## Peak Hours

Prices are 2x off-peak during peak hours:

- 01:00–04:00 UTC
- 06:00–10:00 UTC

All other hours are off-peak (half of peak rates).

## Pricing (effective Aug 17, 2026, Beijing time)

USD per 1M tokens. Peak = 2x off-peak.

| Item | Flash off-peak | Flash peak | Pro off-peak | Pro peak |
| --- | --- | --- | --- | --- |
| Input (cache hit) | $0.007 | $0.014 | $0.022 | $0.044 |
| Input (cache miss) | $0.22 | $0.44 | $0.66 | $1.32 |
| Output | $0.66 | $1.32 | $1.98 | $3.96 |

Source: [DeepSeek API docs](https://api-docs.deepseek.com/quick_start/pricing/)

## Tech Stack

- Vanilla HTML / CSS / JS (no build step)
- Cloudflare Pages (static hosting)
- Service worker for offline caching and PWA install

## Project Structure

```
public/          # Deployed site
  index.html
  styles.css
  app.js         # Pricing + peak logic
  sw.js          # Service worker
  manifest.json  # PWA manifest
  icon-*.png     # PWA icons
wrangler.toml    # Cloudflare Pages config
```

## Local Development

```bash
npm install
npx wrangler pages dev public
```

## Deploy

```bash
npx wrangler pages deploy public --project-name deepseek-pricing
```

## Updating Prices

Prices live in `BASE_PRICES` at the top of `public/app.js` (off-peak rates). Peak prices are computed automatically as 2x off-peak.

> Verify current rates with DeepSeek before relying on this data.
