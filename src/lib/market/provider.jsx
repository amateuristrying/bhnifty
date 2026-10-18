import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
} from 'react'
import { MarketStore } from './store'
import { marketState } from './clock'

/*
 * The single seam between the app and its data.
 *
 * Every component reads the market through these hooks and never touches the
 * feed directly. Swapping the canned walk for the Angel One SmartAPI means
 * building a store that emits the same quote shape — no component changes.
 */

const MarketContext = createContext(null)

export function MarketProvider({ children }) {
  const store = useMemo(() => new MarketStore(), [])

  useEffect(() => {
    store.start()
    /* a backgrounded tab has no business burning ticks */
    const onVisibility = () => (document.hidden ? store.stop() : store.start())
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      store.stop()
    }
  }, [store])

  return <MarketContext.Provider value={store}>{children}</MarketContext.Provider>
}

export function useMarket() {
  const store = useContext(MarketContext)
  if (!store) throw new Error('useMarket must be used inside <MarketProvider>')
  return store
}

/* One symbol, one subscription — a tick on RELIANCE renders the RELIANCE tile */
export function useQuote(sym) {
  const store = useMarket()
  const subscribe = useCallback((fn) => store.subscribeSymbol(sym, fn), [store, sym])
  const snapshot = useCallback(() => store.getQuote(sym), [store, sym])
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

export function useIndex(key) {
  const store = useMarket()
  const subscribe = useCallback((fn) => store.subscribeIndex(key, fn), [store, key])
  const snapshot = useCallback(() => store.getIndex(key), [store, key])
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/* Historical points for a range — generated once, then cached by the store */
export function useSeries(key, range) {
  const store = useMarket()
  return useMemo(() => store.getSeries(key, range), [store, key, range])
}

/*
 * OHLC for one instrument on one timeframe. Subscribes to the symbol so the
 * close keeps ticking, and re-derives the window whenever either changes.
 */
export function useCandle(sym, timeframe) {
  const q = useQuote(sym)
  const store = useMarket()
  return useMemo(
    () => store.getCandle(sym, timeframe),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, sym, timeframe, q?.seq],
  )
}

/*
 * The card charts. The cached shape is generated once per instrument; only its
 * tip is replaced with the live price here, so a tick redraws the last segment
 * rather than re-walking the whole session.
 */
export function useStockSeries(sym, points) {
  const q = useQuote(sym)
  const store = useMarket()
  return useMemo(() => {
    const base = store.getStockSeries(sym, points)
    if (!base.length) return base
    const out = base.slice()
    out[out.length - 1] = q.ltp
    return out
  }, [store, sym, points, q?.ltp])
}

export function useStockCandles(sym, count) {
  const q = useQuote(sym)
  const store = useMarket()
  return useMemo(() => {
    const base = store.getStockCandles(sym, count)
    if (!base.length) return base
    const out = base.slice()
    const last = { ...out[out.length - 1], c: q.ltp }
    last.h = Math.max(last.h, q.ltp)
    last.l = Math.min(last.l, q.ltp)
    out[out.length - 1] = last
    return out
  }, [store, sym, count, q?.ltp])
}

/* Re-poll a set of symbols on demand — the grid's refresh control */
export function useNudge() {
  const store = useMarket()
  return useCallback((symbols) => store.nudge(symbols), [store])
}

/*
 * A ranked slice of the board — top gainers, losers, most traded.
 *
 * Prices inside each row tick live, but the *ordering* only re-settles every
 * few seconds. Re-sorting on every tick would leave rows swapping places
 * constantly, which reads as noise rather than as a market.
 */
export function useRanked(symbols, { by = 'changePct', dir = 'desc', limit = 3, refreshMs = 4500 } = {}) {
  const store = useMarket()
  const [nonce, bump] = useReducer((n) => n + 1, 0)
  const key = symbols.join('|')

  useEffect(() => {
    const id = setInterval(bump, refreshMs)
    return () => clearInterval(id)
  }, [refreshMs])

  return useMemo(() => {
    const rows = key.split('|').map((s) => store.getQuote(s)).filter(Boolean)
    rows.sort((a, b) => (dir === 'desc' ? b[by] - a[by] : a[by] - b[by]))
    return rows.slice(0, limit).map((q) => q.sym)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, key, by, dir, limit, nonce])
}

/* Exchange clock — ticks once a second, and only where it is rendered */
export function useMarketClock() {
  const [state, setState] = useState(() => marketState())
  useEffect(() => {
    const id = setInterval(() => setState(marketState()), 1000)
    return () => clearInterval(id)
  }, [])
  return state
}
