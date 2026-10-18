import { useEffect, useRef } from 'react'
import { gsap, motionOK } from '../../../lib/motion'

/*
 * The card's session at a glance — a line with an area beneath it, or the same
 * walk grouped into candles.
 *
 * Drawn in a fixed viewBox stretched to the card width. Strokes carry
 * `vector-effect: non-scaling-stroke` so the horizontal stretch never thickens
 * or thins them.
 */

const W = 260
const H = 64
const PAD = 6

const scaler = (values) => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.abs(max) * 0.001 || 1
  return (v) => PAD + (1 - (v - min) / span) * (H - PAD * 2)
}

function LineChart({ values, tone, gradientId }) {
  const y = scaler(values)
  const x = (i) => (i / (values.length - 1)) * W
  const line = 'M' + values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L')
  const area = `${line} L${W},${H} L0,${H} Z`

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.22" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        data-line
        d={line}
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </>
  )
}

function CandleSet({ candles }) {
  const all = candles.flatMap((c) => [c.h, c.l])
  const y = scaler(all)
  const step = W / candles.length
  const body = Math.max(3, step * 0.52)

  return (
    <g>
      {candles.map((c, i) => {
        const up = c.c >= c.o
        const tone = up ? 'var(--up)' : 'var(--down)'
        const cx = i * step + step / 2
        const top = y(Math.max(c.o, c.c))
        const bottom = y(Math.min(c.o, c.c))
        return (
          <g key={i} data-candle>
            <line
              x1={cx}
              x2={cx}
              y1={y(c.h)}
              y2={y(c.l)}
              stroke={tone}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={cx - body / 2}
              y={top}
              width={body}
              /* a doji still needs a visible mark */
              height={Math.max(1.5, bottom - top)}
              fill={tone}
              rx="0.5"
            />
          </g>
        )
      })}
    </g>
  )
}

export default function MiniChart({ mode, values, candles, up, id }) {
  const ref = useRef(null)
  const tone = up ? 'var(--up)' : 'var(--down)'

  /* the chart strokes itself in the first time the card is seen */
  useEffect(() => {
    if (!motionOK() || !ref.current) return
    const line = ref.current.querySelector('[data-line]')
    const bars = ref.current.querySelectorAll('[data-candle]')
    let tween
    if (line) {
      const len = line.getTotalLength()
      tween = gsap.fromTo(
        line,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', clearProps: 'strokeDasharray' },
      )
    } else if (bars.length) {
      tween = gsap.from(bars, {
        scaleY: 0,
        transformOrigin: 'center',
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.015,
      })
    }
    return () => tween?.revert()
  }, [mode])

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-16 block"
      aria-hidden="true"
    >
      {mode === 'candles' ? (
        <CandleSet candles={candles} />
      ) : (
        <LineChart values={values} tone={tone} gradientId={id} />
      )}
    </svg>
  )
}
