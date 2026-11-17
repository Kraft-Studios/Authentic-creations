# Authentic Creations — website

A premium, black & white, scroll-driven website for Authentic Creations (branding, personalised gifts, packaging & digital printing, South Africa), with photoreal 3D products and a 3D design studio where customers design a product and order it on WhatsApp.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## What's where

| Path | What it is |
|---|---|
| `src/app/page.tsx` | Home: hero → about → services → gallery → big type → products & prices → studio → process → statement → contact |
| `src/app/studio/` + `src/studio/` | 3D design studio: Fabric.js print-area editor (`editor.ts`) whose canvas is the live texture on the 3D product (`Viewer.tsx`) |
| `src/three/` | Photoreal procedural products (`ProductModel.tsx`), studio lighting (`Lights.tsx` + `public/hdr/studio.hdr`), surface textures (`textures.ts`), heat-press reveal shader (`reveal.ts`) |
| `src/components/InkCursor.tsx` | "Spilled ink" cursor (WebGL metaballs, `difference` blend) |
| `src/components/ThemeToggle.tsx`, `src/lib/theme.ts` | Light/Dark mode toggle (styled after freefaces.gallery), default dark |
| `src/lib/site.ts`, `products.ts`, `media.ts` | Contact details & copy, products & prices, photography |

Stack: Next.js 16, React 19, React Three Fiber + drei, GSAP (ScrollTrigger, Flip), Lenis, Fabric.js, Tailwind CSS 4.

## Design system

- Colours: black & white only — light `#fcfcfc` / dark `#161616`. Colour appears only on the 3D products (and photos on hover).
- Type: **Archiv Grotesk** (all text) and **Major Mono Display** (labels, accents). Major Mono is always set lower-case, which renders as clean monospaced capitals.

## Confirm with the client before launch

- **WhatsApp number** — TikTok bio says 071 903 2441 (used on the site); some video captions say 066 500 3006.
- **Prices** — from their posts: mousepad R120, mug R150, tumbler R270, keyholder R90. Water bottle, T-shirts and boxes are "Quote".
- **Products** — confirm T-shirts/uniforms and branded boxes are offered.
- **Location, turnaround, delivery fees** — not public yet, so the site doesn't state them.
- **Domain** — authenticcreations.co.za has a certificate error; pointing it at the new host fixes that.
- **Archiv Grotesk licence** — free to download (freefaces.gallery lists it), but its designer states no licence. Confirm commercial use with the designer (Behance: "Free Archive Grotesk Sans Serif Font") or swap it for a licensed grotesk before launch. The file is `src/fonts/ArchivGrotesk-Regular.woff2`.

## Media & licences

- **Photos** (`public/media/photos/`) — CC0 / public domain from StockSnap and rawpixel via Openverse. Sources in `public/media/photos/credits.json`.
- **Photos** (`public/media/stock/`) — Unsplash License:
  - `printing-machine.jpg` — https://unsplash.com/photos/printing-machine-Tzm3Oyu_6sk
  - `screen-print-yellow.jpg` — https://unsplash.com/photos/screen-printing-machine-with-yellow-ink-design-6H2Ti474w_w
  - `printer-pink-banner.jpg` — https://unsplash.com/photos/industrial-printer-with-pink-banner-CYrYxz-uvE4
- **Lighting** — `public/hdr/studio.hdr` is Poly Haven "Studio Small 09" (CC0).
- **Fonts** — Major Mono Display (Open Font License, via Google Fonts). Archiv Grotesk — see the note above.
- **Logo** — redrawn as SVG in `src/components/Logo.tsx` from the client's profile picture.
- No TikTok or Instagram images are used.
