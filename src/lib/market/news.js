/*
 * Placeholder regulatory feed. Market-wide rather than per-instrument, which is
 * how the filings desk actually reads. Swap for a real wire (or the exchange's
 * corporate-announcements endpoint) without touching the component: keep the
 * { id, headline, source, agoMinutes } shape.
 */
export const NEWS = [
  {
    id: 'rbi-repo-hold',
    headline: 'RBI Holds Key Repo Rate Constant; Banking Sector Index Flashes Green',
    source: 'Reserve Bank of India',
    agoMinutes: 240,
  },
  {
    id: 'psu-credit-growth',
    headline: 'Public Sector Banks Lead Credit Growth Spurt in Metropolitan Regions',
    source: 'PTI Feed',
    agoMinutes: 360,
  },
  {
    id: 'car-audit',
    headline: 'Capital Adequacy Ratio (CAR) of Private Banks Remains Solid, Says Audit',
    source: 'Financial Express',
    agoMinutes: 480,
  },
  {
    id: 'sebi-disclosure',
    headline: 'SEBI Tightens Related-Party Disclosure Norms for Listed Entities',
    source: 'SEBI',
    agoMinutes: 620,
  },
  {
    id: 'nse-fo-review',
    headline: 'NSE Announces Half-Yearly Review of F&O Contract Eligibility',
    source: 'NSE India',
    agoMinutes: 900,
  },
]

/* "4h ago" — the feed never needs finer than minutes */
export function timeAgo(minutes) {
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
