/*
 * The radial rupee-circuit: a central chip radiating dotted connectors to
 * twelve capabilities. Geometry is computed so the six left / six right
 * connector rows line up with the feature rows beside it.
 */
const W = 720
const H = 520
const CX = W / 2
const CY = H / 2
const R = 86

export const ROWS = [56, 138, 220, 302, 384, 466] // connector row baselines

function trace(side, rowY, i) {
  const spread = [-58, -34, -12, 12, 34, 58] // degrees off horizontal
  const a = (spread[i] * Math.PI) / 180
  const dir = side === 'right' ? 1 : -1
  const sx = CX + dir * Math.cos(a) * (R + 6)
  const sy = CY + Math.sin(a) * (R + 6)
  const elbowX = CX + dir * 170
  const endX = side === 'right' ? W : 0
  return { d: `M${sx.toFixed(1)},${sy.toFixed(1)} L${elbowX},${rowY} L${endX},${rowY}`, endX, rowY }
}

const LEFT = ROWS.map((y, i) => trace('left', y, i))
const RIGHT = ROWS.map((y, i) => trace('right', y, i))

/* chip tick marks at 45° intervals */
const TICKS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * 45 * Math.PI) / 180
  return {
    x1: CX + Math.cos(a) * (R + 4),
    y1: CY + Math.sin(a) * (R + 4),
    x2: CX + Math.cos(a) * (R + 16),
    y2: CY + Math.sin(a) * (R + 16),
  }
})

export default function RupeeCircuit({ className = '' }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      {/* connectors travel centre → node */}
      {[...LEFT, ...RIGHT].map((t, i) => (
        <g key={i}>
          <path
            data-connector
            d={t.d}
            fill="none"
            stroke="var(--ink-faint)"
            strokeWidth="1.2"
            strokeDasharray="2 6"
          />
          <circle data-node cx={t.endX === 0 ? 4 : W - 4} cy={t.rowY} r="3.5" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
        </g>
      ))}

      {/* the core powers on */}
      <g data-chip>
        <circle cx={CX} cy={CY} r={R} fill="var(--panel)" stroke="var(--ink)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={R - 16} fill="none" stroke="var(--rule)" strokeWidth="1" />
        {TICKS.map((t, i) => (
          <line key={i} data-tick x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--ink)" strokeWidth="1.2" />
        ))}
        {/* rupee glyph, drawn as strokes like the rest of the circuit */}
        <g
          transform={`translate(${CX - 44}, ${CY - 44}) scale(3.67)`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          <path d="M6 3h12" vectorEffect="non-scaling-stroke" />
          <path d="M6 8h12" vectorEffect="non-scaling-stroke" />
          <path d="m6 13 8.5 8" vectorEffect="non-scaling-stroke" />
          <path d="M6 13h3" vectorEffect="non-scaling-stroke" />
          <path d="M9 13c6.667 0 6.667-10 0-10" vectorEffect="non-scaling-stroke" />
        </g>
      </g>
    </svg>
  )
}
