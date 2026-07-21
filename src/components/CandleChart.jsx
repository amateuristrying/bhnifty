/*
 * The About/Vision frame: a candlestick chart that builds left → right with a
 * tightrope strung between its two peaks. The walker is a still asset supplied
 * later — its slot idles on the rope. The one place candles (not lines) appear.
 */
const SHAPE = [
  150, 140, 132, 120, 108, 95, 84, 74, 66, 60, 64, 74, 90, 110, 135, 165, 195,
  225, 255, 280, 295, 302, 296, 282, 260, 232, 200, 168, 138, 112, 90, 80, 88,
  102, 118,
]
const W = 480
const H = 340
const STEP = (W - 20) / SHAPE.length
const BODY_W = 7.5

const CANDLES = SHAPE.map((cur, i) => {
  const prev = i === 0 ? cur + 10 : SHAPE[i - 1]
  const up = cur < prev // smaller y = price rose
  const top = Math.min(cur, prev)
  const h = Math.max(5, Math.abs(cur - prev))
  const x = 10 + i * STEP
  return { x, top, h, up, wickTop: top - 8, wickBot: top + h + 8 }
})

/* rope spans the two peaks with a gentle sag */
const P1 = { x: 10 + 9 * STEP + BODY_W / 2, y: 60 - 14 }
const P2 = { x: 10 + 31 * STEP + BODY_W / 2, y: 80 - 14 }
const SAG = { x: (P1.x + P2.x) / 2, y: Math.max(P1.y, P2.y) + 34 }
const ROPE_D = `M${P1.x},${P1.y} Q${SAG.x},${SAG.y} ${P2.x},${P2.y}`

/* walker slot sits at t≈0.55 along the rope (quadratic bezier point) */
const T = 0.55
const wx = (1 - T) ** 2 * P1.x + 2 * (1 - T) * T * SAG.x + T ** 2 * P2.x
const wy = (1 - T) ** 2 * P1.y + 2 * (1 - T) * T * SAG.y + T ** 2 * P2.y

export default function CandleChart({ className = '' }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      {CANDLES.map((c, i) => (
        <g key={i} className="bhn-candle" data-candle>
          <line
            x1={c.x + BODY_W / 2}
            y1={c.wickTop}
            x2={c.x + BODY_W / 2}
            y2={c.wickBot}
            stroke={c.up ? 'var(--up)' : 'var(--down)'}
            strokeWidth="1.2"
          />
          <rect
            x={c.x}
            y={c.top}
            width={BODY_W}
            height={c.h}
            rx="1.5"
            fill={c.up ? 'var(--up)' : 'var(--down)'}
            opacity="0.92"
          />
        </g>
      ))}

      {/* rope line-draws after the candles */}
      <path data-rope d={ROPE_D} fill="none" stroke="var(--ink)" strokeWidth="1.4" />

      {/* still-silhouette slot — swap for the final walker asset */}
      <g data-walker transform={`translate(${wx}, ${wy})`}>
        <rect
          x="-14"
          y="-46"
          width="28"
          height="44"
          rx="4"
          fill="var(--paper)"
          stroke="var(--ink-faint)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          textAnchor="middle"
          y="-24"
          style={{ font: '700 6.5px "Plus Jakarta Sans", sans-serif', letterSpacing: '0.12em' }}
          fill="var(--ink-faint)"
        >
          WALKER
        </text>
        <text
          textAnchor="middle"
          y="-15"
          style={{ font: '700 6.5px "Plus Jakarta Sans", sans-serif', letterSpacing: '0.12em' }}
          fill="var(--ink-faint)"
        >
          ASSET
        </text>
      </g>
    </svg>
  )
}
