/* Ledger-row mini-line, coloured by direction; drawn in by the Preview section */
export default function Sparkline({ data, up = true, className = '' }) {
  const W = 160
  const H = 36
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const d =
    'M' +
    data
      .map((v, i) => `${((i / (data.length - 1)) * W).toFixed(1)},${(H - 5 - ((v - min) / span) * (H - 10)).toFixed(1)}`)
      .join(' L')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full h-9 ${className}`} data-spark aria-hidden="true">
      <line x1="0" y1={H - 4} x2={W} y2={H - 4} stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 5" />
      <path
        data-spark-line
        d={d}
        fill="none"
        stroke={up ? 'var(--up)' : 'var(--down)'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
