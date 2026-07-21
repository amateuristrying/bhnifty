# BHnifty

The editorial trading console — BHnifty's marketing site and sign-in surface. A financial
newspaper that happens to be live: serif headlines carry the voice, an uppercase grotesque
carries the interface, and colour appears only where money moves.

## Tech stack

- [Vite](https://vitejs.dev/) 6 + [React](https://react.dev/) 18
- [Tailwind CSS](https://tailwindcss.com/) v4 (`@tailwindcss/vite`)
- [GSAP](https://gsap.com/) + ScrollTrigger — all entrance/scroll motion
- [Three.js](https://threejs.org/) — ambient ink dot-field in the hero

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build locally
```

## Structure

```
src/
  main.jsx                  # React entry (BrowserRouter)
  App.jsx                   # routes + light/dark theme state (light default)
  index.css                 # Tailwind v4 + paper/ink theme tokens (light & dark)
  lib/
    motion.js               # GSAP setup, settle easing, reveal constants, ?nomotion gate
    useLiveTicks.js         # canned live-market replay (random-walk ticks)
  components/
    Navbar.jsx              # editorial nav + active-section dot + theme toggle
    ThemeToggle.jsx         # day/night toggle (top-right on every screen)
    Icon.jsx                # inline Lucide icon set
    AmbientField.jsx        # Three.js dot-field (pauses when hidden, off under reduced motion)
    HeroChart.jsx           # line-draw index chart + ticking price tag
    RupeeCircuit.jsx        # radial rupee-circuit SVG with animated connectors
    Sparkline.jsx           # ledger row mini-lines, coloured by direction
    CandleChart.jsx         # candle build + tightrope; walker slot awaits final asset
    Placeholder.jsx         # reserved frames for illustration assets (swap for <img>)
  sections/                 # Hero, Features, Preview, Why, About, Faq, Contact, Footer
  pages/
    Landing.jsx             # one-page scroll of the six landing sections (+ FAQ)
    Login.jsx               # split auth screen — illustration + boxed form
```

## Motion language

Settle, don't bounce: `cubic-bezier(0.16, 1, 0.3, 1)`, 500–700ms, reveals trigger once at
~15% visibility with 60–90ms child staggers. Live data (price ticks, value flashes) is the
only self-moving thing on the page. All motion is wrapped in `prefers-reduced-motion` —
reveals become instant, tickers stop, line-draws are skipped. Appending `?nomotion` to any
URL forces the same static path (useful for testing and screenshots).

## Theming

Light (paper) is the default; dark (ink) inverts the whole system. Class-based
(`<html class="dark">`), persisted in `localStorage`. Semantic tokens (`--color-paper`,
`--color-ink`, `--color-rule`, `--color-up/down`…) resolve to CSS variables that flip per
theme. Green/red are reserved exclusively for live financial values.

## Pending assets

Illustration slots ship as labeled `Placeholder` frames — swap each for the final art
without touching layout or animation:

- **Why BHnifty** — three tall noir panels (`NOIR I–III`)
- **About / Vision** — walker silhouette on the tightrope (`WALKER ASSET`)
- **Sign In** — handshake illustration (`HANDSHAKE`)

## Deployment (Vercel)

Zero-config — the Vite preset is pinned in `vercel.json` along with an SPA rewrite so
`/login` resolves client-side. Vendor chunks (`three`, `gsap`, `react`) are split for
long-term caching.
