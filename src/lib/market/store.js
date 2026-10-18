import { INSTRUMENTS, INDICES } from './universe'
import { lastSessionWindow } from './clock'

/*
 * The market store — a tiny observable that holds one immutable quote object
 * per symbol and one per index, and hands out per-key subscriptions so a tick
 * on RELIANCE re-renders the RELIANCE tile and nothing else.
 *
 * Today it is fed by `_tick()`, a canned random walk. When the Angel One feed
 * lands, `_tick` is replaced by the SmartAPI websocket handler calling
 * `applyQuote(sym, ltp)` — every consumer downstream is already correct.
 */

const DAY_MS = 86400000
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/* Deterministic PRNG so a reload shows the same considered board, not noise */
function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (str) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

/* How many points each range draws, and how far back it reaches */
const RANGE_SHAPE = {
  '1D': { points: 76, span: 0 }, // 09:15 → 15:30 in 5-minute steps
  '1W': { points: 40, span: 7 * DAY_MS },
  '1M': { points: 44, span: 30 * DAY_MS },
  '1Y': { points: 60, span: 365 * DAY_MS },
  '5Y': { points: 62, span: 5 * 365 * DAY_MS },
}

/* Longer horizons wander further from the open */
const RANGE_VOL = { '1D': 0.22, '1W': 0.5, '1M': 0.9, '1Y': 2.4, '5Y': 4.2 }

/* How wide a single candle sits, and how much of a session's volume it holds */
const TF_SPREAD = {
  '1m': 0.0012,
  '5m': 0.0026,
  '15m': 0.0042,
  '30m': 0.0061,
  '1H': 0.0094,
  '4H': 0.0168,
  '1W': 0.0355,
}
const TF_VOLUME = {
  '1m': 0.002,
  '5m': 0.009,
  '15m': 0.024,
  '30m': 0.046,
  '1H': 0.088,
  '4H': 0.32,
  '1W': 4.7,
}

export class MarketStore {
  constructor() {
    this.quotes = new Map()
    this.indices = new Map()
    this._symbolSubs = new Map()
    this._indexSubs = new Map()
    this._series = new Map()
    this._stockSeries = new Map()
    this._stockCandles = new Map()
    this._timer = null
    this._running = false
    this._seed()
  }

  /* ---------------------------------------------------------------- seeding */

  _seed() {
    for (const inst of INSTRUMENTS) {
      const rnd = mulberry32(hash(inst.sym))
      rnd() // discard the first draw — it correlates with the seed
      const changePct = (rnd() * 2 - 1) * 2.6
      const prevClose = inst.base
      const ltp = prevClose * (1 + changePct / 100)

      /* the session so far, plus the technicals the analysis console reads */
      const open = prevClose * (1 + (rnd() - 0.5) * 0.007)
      const high = Math.max(open, ltp) * (1 + rnd() * 0.009)
      const low = Math.min(open, ltp) * (1 - rnd() * 0.009)
      const volume = Math.round((0.4 + rnd() * 9) * 1e6)

      /*
       * Which chart suits this stock's session, decided once. A day that
       * ranged widely relative to its net move reads better as candles; one
       * that trended cleanly reads better as a line. Frozen at seed because a
       * chart must never change representation while you are watching it.
       */
      const netMove = Math.max(Math.abs(ltp - open), ltp * 0.0001)
      const chart = (high - low) / netMove >= 1.6 ? 'candles' : 'line'

      this.quotes.set(inst.sym, {
        sym: inst.sym,
        short: inst.short,
        name: inst.name,
        weight: inst.weight,
        prevClose,
        ltp,
        change: ltp - prevClose,
        changePct,
        dir: changePct >= 0 ? 1 : -1,
        open,
        high,
        low,
        volume,
        avgVolume: Math.round(volume * (0.7 + rnd() * 0.7)),
        week52High: inst.base * (1.14 + rnd() * 0.34),
        week52Low: inst.base * (0.61 + rnd() * 0.23),
        /* levels are structural — they do not jitter on every tick */
        support: low * (0.988 - rnd() * 0.012),
        resistance: high * (1.011 + rnd() * 0.013),
        vwap: (open + high + low + ltp) / 4,
        chart,
        ts: Date.now(),
        seq: 0,
      })
    }

    for (const key of Object.keys(INDICES)) {
      const cfg = INDICES[key]
      const series = this.getSeries(key, '1D')
      const vals = series.map((p) => p.v)
      const level = this._level(key)
      this.indices.set(key, {
        key,
        name: cfg.name,
        prevClose: cfg.prevClose,
        open: cfg.open,
        ltp: level,
        change: level - cfg.prevClose,
        changePct: ((level - cfg.prevClose) / cfg.prevClose) * 100,
        high: Math.max(...vals, level),
        low: Math.min(...vals, level),
        seq: 0,
      })
    }
  }

  /* Index level from its constituents, weighted exactly as the index is */
  _level(key) {
    const cfg = INDICES[key]
    let weights = 0
    let acc = 0
    for (const m of cfg.members) {
      const q = this.quotes.get(m.sym)
      if (!q) continue
      weights += m.weight
      acc += m.weight * q.changePct
    }
    const pct = weights ? acc / weights : 0
    return cfg.prevClose * (1 + pct / 100)
  }

  /* ------------------------------------------------------------ chart series */

  /*
   * A session's worth of points, generated once per (index, range) and cached.
   * The walk is affine-corrected so it starts exactly at the open — the live
   * tip is drawn by the chart from the index quote, not from here.
   */
  getSeries(key, range) {
    const id = `${key}:${range}`
    const cached = this._series.get(id)
    if (cached) return cached

    const cfg = INDICES[key]
    const { points, span } = RANGE_SHAPE[range]
    const { from, to } = lastSessionWindow()
    const start = span ? to - span : from
    const step = (to - start) / (points - 1)

    const rnd = mulberry32(hash(id))
    const vol = RANGE_VOL[range] * cfg.prevClose * 0.01
    const drift = (rnd() * 2 - 1) * vol * 0.4

    const out = []
    let v = cfg.open
    for (let i = 0; i < points; i++) {
      const shock = (rnd() * 2 - 1 + (rnd() * 2 - 1)) * vol * 0.5
      v += shock + drift / points
      v += (cfg.open + drift - v) * 0.06 // mean-reverting, never runs to an edge
      out.push({ t: start + i * step, v })
    }

    /* pin the first point to the session open so the stat row and chart agree */
    const lift = cfg.open - out[0].v
    for (const p of out) p.v += lift

    this._series.set(id, out)
    return out
  }

  /* ---------------------------------------------------- per-stock intraday */

  /*
   * A session's shape for one instrument, seeded once and cached. It runs from
   * the open to the last traded price and stays inside the day's range, so the
   * card's chart, its OHLC footer and its headline price all tell one story.
   */
  getStockSeries(sym, points = 42) {
    const id = `${sym}:${points}`
    const cached = this._stockSeries.get(id)
    if (cached) return cached

    const q = this.quotes.get(sym)
    if (!q) return []

    const rnd = mulberry32(hash(`stock:${id}`))
    const band = Math.max(q.high - q.low, q.ltp * 0.002)
    const out = []
    let v = q.open

    for (let i = 0; i < points; i++) {
      const t = i / (points - 1)
      const trend = q.open + (q.ltp - q.open) * t
      v += (rnd() * 2 - 1 + (rnd() * 2 - 1)) * band * 0.2
      v += (trend - v) * 0.28 // never wanders far from where the day went
      out.push(clamp(v, q.low, q.high))
    }
    /* pin the ends so the chart agrees with the numbers beside it */
    out[0] = q.open
    out[points - 1] = q.ltp

    this._stockSeries.set(id, out)
    return out
  }

  /* The same walk, grouped into OHLC bars for the candle view */
  getStockCandles(sym, count = 17) {
    const id = `${sym}:${count}`
    const cached = this._stockCandles.get(id)
    if (cached) return cached

    const per = 3
    const series = this.getStockSeries(sym, count * per)
    const out = []
    for (let i = 0; i < count; i++) {
      const slice = series.slice(i * per, i * per + per)
      out.push({
        o: slice[0],
        c: slice[slice.length - 1],
        h: Math.max(...slice),
        l: Math.min(...slice),
      })
    }
    this._stockCandles.set(id, out)
    return out
  }

  /* ------------------------------------------------------------- timeframes */

  /*
   * OHLC for one instrument over one timeframe window. The close is always the
   * live price, so the panel keeps ticking; the shape of the window around it
   * is seeded per (symbol, timeframe) and therefore stable while you look at
   * it. Replaced wholesale by SmartAPI's candle endpoint when the feed lands.
   */
  getCandle(sym, timeframe) {
    const q = this.quotes.get(sym)
    if (!q) return null
    if (timeframe === '1D') {
      return { open: q.open, high: q.high, low: q.low, close: q.ltp, volume: q.volume }
    }

    const spread = TF_SPREAD[timeframe] ?? 0.01
    const rnd = mulberry32(hash(`${sym}:${timeframe}`))
    const close = q.ltp
    const open = close * (1 + (rnd() - 0.5) * spread * 2)
    return {
      open,
      /* the window must contain its own close */
      high: Math.max(open, close) * (1 + rnd() * spread),
      low: Math.min(open, close) * (1 - rnd() * spread),
      close,
      volume: Math.max(1, Math.round(q.volume * (TF_VOLUME[timeframe] ?? 1))),
    }
  }

  /* --------------------------------------------------------------- the feed */

  /* The seam the Angel One websocket will call — one quote, one notification */
  applyQuote(sym, ltp, extra = {}) {
    const q = this.quotes.get(sym)
    if (!q) return
    const changePct = ((ltp - q.prevClose) / q.prevClose) * 100
    this.quotes.set(sym, {
      ...q,
      ltp,
      change: ltp - q.prevClose,
      changePct,
      dir: ltp >= q.ltp ? 1 : -1,
      high: Math.max(q.high, ltp),
      low: Math.min(q.low, ltp),
      ts: Date.now(),
      seq: q.seq + 1,
      ...extra,
    })
    this._emit(this._symbolSubs, sym)
  }

  _tick() {
    const touched = new Set()
    const count = 5 + Math.floor(Math.random() * 6)

    for (let i = 0; i < count; i++) {
      const inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)]
      const q = this.quotes.get(inst.sym)
      const shock = (Math.random() * 2 - 1 + (Math.random() * 2 - 1)) * 0.09
      let changePct = q.changePct + shock
      changePct -= changePct * 0.015 // gentle pull toward flat
      changePct = clamp(changePct, -6.5, 6.5)
      const ltp = q.prevClose * (1 + changePct / 100)

      this.quotes.set(inst.sym, {
        ...q,
        ltp,
        change: ltp - q.prevClose,
        changePct,
        dir: shock >= 0 ? 1 : -1,
        high: Math.max(q.high, ltp),
        low: Math.min(q.low, ltp),
        volume: q.volume + Math.round(Math.random() * 24000),
        ts: Date.now(),
        seq: q.seq + 1,
      })
      touched.add(inst.sym)
    }

    for (const sym of touched) this._emit(this._symbolSubs, sym)
    for (const key of this.indices.keys()) this._refreshIndex(key)
  }

  _refreshIndex(key) {
    const prev = this.indices.get(key)
    const ltp = this._level(key)
    if (Math.abs(ltp - prev.ltp) < 0.005) return
    this.indices.set(key, {
      ...prev,
      ltp,
      change: ltp - prev.prevClose,
      changePct: ((ltp - prev.prevClose) / prev.prevClose) * 100,
      high: Math.max(prev.high, ltp),
      low: Math.min(prev.low, ltp),
      dir: ltp >= prev.ltp ? 1 : -1,
      seq: prev.seq + 1,
    })
    this._emit(this._indexSubs, key)
  }

  /*
   * Re-poll a set of symbols on demand — what the grid's refresh control does.
   * Becomes a REST quote call against SmartAPI when the feed is wired; the
   * cached chart shapes are dropped so they redraw against the new prices.
   */
  nudge(symbols) {
    for (const sym of symbols) {
      const q = this.quotes.get(sym)
      if (!q) continue
      const shock = (Math.random() * 2 - 1 + (Math.random() * 2 - 1)) * 0.12
      const changePct = clamp(q.changePct + shock, -6.5, 6.5)
      this.applyQuote(sym, q.prevClose * (1 + changePct / 100), {
        volume: q.volume + Math.round(Math.random() * 40000),
      })
      for (const key of [...this._stockSeries.keys()]) {
        if (key.startsWith(`${sym}:`)) this._stockSeries.delete(key)
      }
      for (const key of [...this._stockCandles.keys()]) {
        if (key.startsWith(`${sym}:`)) this._stockCandles.delete(key)
      }
    }
    for (const key of this.indices.keys()) this._refreshIndex(key)
  }

  start(intervalMs = 1300) {
    if (this._running) return
    this._running = true
    this._timer = setInterval(() => this._tick(), intervalMs)
  }

  stop() {
    this._running = false
    clearInterval(this._timer)
    this._timer = null
  }

  /* -------------------------------------------------------- subscriptions */

  _emit(registry, key) {
    const set = registry.get(key)
    if (set) for (const fn of set) fn()
  }

  _sub(registry, key, fn) {
    let set = registry.get(key)
    if (!set) registry.set(key, (set = new Set()))
    set.add(fn)
    return () => {
      set.delete(fn)
      if (!set.size) registry.delete(key)
    }
  }

  subscribeSymbol = (sym, fn) => this._sub(this._symbolSubs, sym, fn)
  subscribeIndex = (key, fn) => this._sub(this._indexSubs, key, fn)

  getQuote = (sym) => this.quotes.get(sym)
  getIndex = (key) => this.indices.get(key)
}
