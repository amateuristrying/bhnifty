/* Number and clock formatting — Indian grouping throughout (1,23,456.78). */

const inr2 = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const fmtPrice = (v) => inr2.format(v)

/* Prices carry the symbol wherever they stand alone, outside a price column */
export const fmtRupee = (v) => `₹${inr2.format(v)}`

/* Plain grouped integer — share counts, not money */
export const fmtCount = (v) => new Intl.NumberFormat('en-IN').format(Math.round(v))

/* Signed absolute move — "−50.80". Uses a true minus so digits stay aligned. */
export const fmtChange = (v) => `${v >= 0 ? '+' : '−'}${inr2.format(Math.abs(v))}`

/* Anything that rounds to zero is flat — never "−0.00%" */
const FLAT = 0.005

export const fmtPct = (v) =>
  Math.abs(v) < FLAT ? '0.00%' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}%`

/* Bare percent for tiles that carry their own sign colour */
export const fmtPctPlain = (v) =>
  Math.abs(v) < FLAT ? '0.00%' : `${v > 0 ? '+' : '-'}${Math.abs(v).toFixed(2)}%`

export const fmtWeight = (v) => `${v.toFixed(1)}%`

/* Volumes read in crore / lakh — the units the Indian desk actually uses */
export function fmtVolume(v) {
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)} Cr`
  if (v >= 1e5) return `${(v / 1e5).toFixed(2)} L`
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return String(Math.round(v))
}

const p2 = (n) => String(n).padStart(2, '0')

/* Wall clock as it reads on the exchange floor */
export const fmtClock = (d) =>
  `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`

/* "07h 31m 42s" — the shape used beside the market status */
export function fmtCountdown(ms) {
  if (ms < 0) ms = 0
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${p2(h)}h ${p2(m)}m ${p2(s)}s`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* Axis labels shift meaning with the range: clock → date → month → year */
export function fmtAxis(ms, range) {
  const d = new Date(ms)
  if (range === '1D') return `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`
  if (range === '1W' || range === '1M') return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
  if (range === '1Y') return MONTHS[d.getUTCMonth()]
  return String(d.getUTCFullYear())
}

/* Tooltip stamp — always says which day it is, plus time on intraday */
export function fmtStamp(ms, range) {
  const d = new Date(ms)
  const day = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  return range === '1D' ? `${day} · ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}` : day
}
