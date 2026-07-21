import { useEffect, useRef, useState } from 'react'

/*
 * Fake live-market engine for the marketing site ("canned replay").
 * Every ~2.2s one or two instruments random-walk; `flash` increments so
 * consumers can pulse the row/tile that changed. Data updates are the
 * only self-moving things on the page.
 */
export default function useLiveTicks(initial) {
  const [rows, setRows] = useState(() =>
    initial.map((r) => ({ ...r, flash: 0 })),
  )
  const timer = useRef(null)

  useEffect(() => {
    function tick() {
      setRows((prev) => {
        const next = prev.map((r) => ({ ...r }))
        const count = Math.random() > 0.6 ? 2 : 1
        for (let n = 0; n < count; n++) {
          const i = Math.floor(Math.random() * next.length)
          const r = next[i]
          const deltaPct = (Math.random() - 0.48) * 0.14 // slight upward drift
          r.price = Math.max(1, r.price * (1 + deltaPct / 100))
          r.changePct = r.changePct + deltaPct
          r.dir = deltaPct >= 0 ? 1 : -1
          r.flash++
        }
        return next
      })
      timer.current = setTimeout(tick, 1800 + Math.random() * 900)
    }
    timer.current = setTimeout(tick, 2200)
    return () => clearTimeout(timer.current)
  }, [])

  return rows
}

export const fmtPrice = (v) =>
  v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtPct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
