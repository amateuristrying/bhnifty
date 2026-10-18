import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/*
 * The user's starred instruments. Kept app-wide rather than inside the
 * dashboard so the Watchlists section can read the same set when it lands,
 * and persisted so a star survives a reload.
 */

const KEY = 'bhnifty-watchlist'
const WatchlistContext = createContext(null)

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function WatchlistProvider({ children }) {
  const [symbols, setSymbols] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(symbols))
    } catch {
      /* a full or blocked store is not worth breaking the page over */
    }
  }, [symbols])

  const toggle = useCallback((sym) => {
    setSymbols((prev) => (prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]))
  }, [])

  /* used by "Add to Watchlist" — adds the whole set, skipping what is there */
  const addMany = useCallback((next) => {
    setSymbols((prev) => [...prev, ...next.filter((s) => !prev.includes(s))])
  }, [])

  const has = useCallback((sym) => symbols.includes(sym), [symbols])

  const value = useMemo(
    () => ({ symbols, toggle, addMany, has }),
    [symbols, toggle, addMany, has],
  )

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used inside <WatchlistProvider>')
  return ctx
}
