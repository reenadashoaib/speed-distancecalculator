# Speed Distance Calculator

A static speed, distance and time calculator website, ready for Cloudflare Pages and Google AdSense. Plain HTML, CSS and JavaScript, with no build step.

The website lives in [`site/`](site/). Everything else in the repo (such as `.claude/`) is tooling and is not published.

## Deploy on Cloudflare

The site is live at https://speed-distance-calculator.reenadashoaib.workers.dev, served by Cloudflare Workers static assets.

To publish changes, run from the repo root:

```
npx wrangler deploy
```

`wrangler.jsonc` tells Cloudflare to publish only the `site/` folder. You need to be logged in (`npx wrangler login`) or have `CLOUDFLARE_API_TOKEN` set.

To use your own domain: Cloudflare dashboard → **Workers & Pages** → **speed-distance-calculator** → **Settings** → **Domains & Routes** → **Add** → **Custom domain**. The domain has to be on your Cloudflare account.

## After you have a domain

Replace `https://example.com` with your domain in:

- `site/index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html` (the `canonical` and `og:url` tags)
- `site/robots.txt` and `site/sitemap.xml`

Also replace `hello@example.com` in `site/contact.html` with the address you want people to email.

## Connect AdSense

1. Apply at [adsense.google.com](https://adsense.google.com) with your domain.
2. Put your publisher ID in `site/ads.txt` (replace `pub-0000000000000000`).
3. Open `site/js/ad-config.js`:
   - set `adsenseClient` to `"ca-pub-…"`
   - in AdSense, create one display ad unit per slot and paste each unit's ID into its `adsenseSlot`

Until IDs are filled in, every slot shows a grey placeholder with its size, so you can see the layout.

To sell a slot directly to an advertiser, paste their creative's HTML into that slot's `html` field. It overrides AdSense for that slot only.

| Slot | Where | Size |
|---|---|---|
| `top-banner` | Below the header | 728 × 90 (320 × 100 on phones) |
| `rail-left` | Sticky left column, wide screens only | 160 × 600 |
| `rail-right` | Sticky right column, laptop and up | 300 × 600 |
| `tile-1` … `tile-6` | Two rows of three tiles in the page | 300 × 250 |
| `in-article` | Between the formula and the speed tables | Responsive |
| `footer-banner` | Above the footer | 728 × 90 |
| `video-corner` | Floating box, bottom right, closable | 16:9 |
| `interstitial` | Full-screen overlay, once per visit | 336 × 280 or larger |

The timing of the corner box and the full-screen overlay is set at the bottom of `ad-config.js`.

## AdSense policy notes

Read these before you apply. Breaking AdSense rules can get the account suspended.

- **Full-screen overlay:** AdSense does not allow its ads inside your own pop-ups. For AdSense, turn this slot off (`interstitial.enabled: false`) and switch on **Vignette ads** in AdSense → Ads → Auto ads instead. That is Google's own full-screen format. Keep the overlay for ads you sell directly.
- **Corner video:** AdSense display units are not video ads. For real video ads in that box, use a video network or a directly sold creative through the slot's `html`, or turn on AdSense's **Anchor ads**, which are allowed to stick to the screen.
- **Ad density:** Google may refuse sites with more ads than content, especially on phones. If approval is refused, apply with fewer slots switched on and add them back later.
- **Consent:** for visitors from the UK, EEA and Switzerland, set up Google's consent message in AdSense → Privacy & messaging.
