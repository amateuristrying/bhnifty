# BHnifty

The editorial trading console — BHnifty's marketing site, sign-in surface and the console
behind it. A financial newspaper that happens to be live: serif headlines carry the voice,
an uppercase grotesque carries the interface, and colour appears only where money moves.

## Surfaces

| Route | What it is |
| --- | --- |
| `/` | Marketing landing page (one-page scroll) |
| `/login` | Sign-in — **placeholder auth, any credentials work** |
| `/app` | Market Overview dashboard |
| `/app/{trading,scanner,news,watchlists,budgets,settings}` | Reserved, awaiting the live feed |

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
    format.js               # en-IN prices, percents, volumes, countdowns, axis stamps
    auth.jsx                # placeholder session + RequireAuth route guard
    watchlist.jsx           # starred instruments, persisted to localStorage
    market/
      universe.js           # NIFTY 50 / NIFTY BANK constituents, weights, Angel tokens
      clock.js              # NSE session clock (09:15–15:30 IST, Mon–Fri)
      store.js              # observable quote store + canned tick engine
      news.js               # placeholder regulatory feed
      provider.jsx          # useQuote / useIndex / useSeries / useRanked / useMarketClock
  app/
    AppShell.jsx            # fixed rail + sticky header + scrolling content column
    Sidebar.jsx             # sections rail; one selection block slides between items
    Topbar.jsx              # greeting, theme, notifications, account menu
    AppFooter.jsx           # copyright + system status
    components/
      Monogram.jsx          # ticker monogram square (stands in for brand marks)
      Ticker.jsx            # GSAP count-up number, written straight to the DOM
    dashboard/
      Dashboard.jsx         # composes the three sections of the console
      selection.jsx         # which instrument the analysis console is reading
      MarketOverview.jsx    # masthead, index stat row, range rail, movers panels
      IndexChart.jsx        # intraday line + area, value/time axes, crosshair readout
      MoversPanel.jsx       # gainers / losers / volume, ranked and ticking
      HeatMap.jsx           # weighted blocks on a five-step heat scale
      console/
        AnalysisConsole.jsx # instrument header, indicators menu, timeframe rail
        MetricsSummary.jsx  # OHLC + volume + the switched-on technical overlays
        AlertsCockpit.jsx   # arm price / percent alerts against the live quote
        NewsFeed.jsx        # regulatory headlines
      constituents/
        ConstituentGrid.jsx # section header, chart-style rail, watchlist, refresh
        StockCard.jsx       # one bank: price, change, chart, OHLC + volume footer
        MiniChart.jsx       # the card's session as a line or as candles
    pages/Soon.jsx          # reserved surfaces behind the rail
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

## The dashboard

Three sections, top to bottom:

1. **Market Overview** — the NIFTY 50 level, its session stats, an intraday chart with a
   crosshair readout, and the top banks / top movers boards.
2. **Weight heat maps** — NIFTY BANK and the non-bank NIFTY 50, blocks coloured by today's
   move on a five-step scale.
3. **Expanded Analysis Console** — everything about one instrument.
4. **BankNifty Constituent Stocks** — a card per bank, alphabetical.

The third section reads whatever the others point at: **every heat-map tile, mover row and
stock card is a selector**. Clicking one loads it into the console and scrolls it into view;
the back arrow walks the trail of what you looked at. The timeframe rail re-derives OHLC and
traded volume for the window, and the indicators menu switches the technical blocks
(support/resistance, 52-week range, VWAP, day range) on and off. Alerts arm against the live
quote and light up when their condition is met — they are per-instrument and in-memory.

Each stock card carries its session as a line or as candles. On **Auto** the card wears
whichever suits it: a day that ranged widely relative to its net move reads better as
candles, one that trended cleanly reads better as a line. That choice is frozen when the
store seeds, so a live tick can never flip a chart's representation while it is being read —
the section's rail overrides every card either way. Stars write through to a persisted
watchlist (`lib/watchlist.jsx`), and refresh re-polls the whole set.

## Market data — swapping in Angel One

Every component reads the market through the hooks in `lib/market/provider.jsx` and never
touches a feed directly. Today `MarketStore._tick()` walks the board at random; the quote
shape it emits is the contract:

```js
{ sym, short, name, weight, prevClose, ltp, change, changePct, dir, volume, seq }
```

To go live: fill the `token` fields in `universe.js` with SmartAPI instrument tokens, then
have the SmartAPI websocket call `store.applyQuote(sym, ltp)` instead of `_tick()`. Index
levels, movers rankings, heat-map bands and the chart tip all derive from those quotes, so
nothing downstream changes. Historical candles replace `store.getSeries(key, range)`.

Subscriptions are per-symbol via `useSyncExternalStore` — a tick on RELIANCE re-renders the
RELIANCE tile and nothing else. Rankings deliberately re-settle every few seconds rather
than on every tick, so rows don't swap places constantly.

## Authentication

`lib/auth.jsx` is a **placeholder**: any credentials sign in, the session is a localStorage
blob, and there is no network call or password check. `RequireAuth` guards `/app` and
records where you were headed, so signing back in returns you there. Replacing it with the
broker's real login touches that one file.

## Pending assets

Illustration slots ship as labeled `Placeholder` frames — swap each for the final art
without touching layout or animation:

- **Why BHnifty** — three tall noir panels (`NOIR I–III`)
- **About / Vision** — walker silhouette on the tightrope (`WALKER ASSET`)
- **Sign In** — handshake illustration (`HANDSHAKE`)

Instrument logos ship as type: `Monogram` renders the ticker's short name in a bordered
square, sized to fit. Swap it for `<img>` marks without touching any layout.

## Deployment (Vercel)

Zero-config — the Vite preset is pinned in `vercel.json` along with an SPA rewrite so
`/login` resolves client-side. Vendor chunks (`three`, `gsap`, `react`) are split for
long-term caching.
