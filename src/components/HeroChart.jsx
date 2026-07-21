import { useEffect, useRef, useState } from 'react'
import { gsap, SETTLE, MOTION_QUERY, motionOK } from '../lib/motion'
import { fmtPrice } from '../lib/useLiveTicks'

/* Index line — rises with pullbacks, benchmark trails dotted behind it */
const YS = [
  78, 76, 77, 74, 75, 71, 73, 69, 70, 66, 68, 63, 66, 60, 62, 57, 60, 54, 57,
  50, 53, 47, 50, 44, 48, 41, 45, 38, 42, 34, 38, 30, 34, 27, 31, 23, 27, 19,
  23, 15, 18, 11, 14, 8,
]
const W = 640
const H = 340
const pts = YS.map((y, i) => [ (i / (YS.length - 1)) * W, (y / 100) * H ])
const lineD = 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')
const endX = pts[pts.length - 1][0]
const endY = pts[pts.length - 1][1]

export default function HeroChart() {
  const root = useRef(null)
  const [price, setPrice] = useState(24834.25)
  const [pct, setPct] = useState(1.23)
  const [dir, setDir] = useState(1)
  const tagRef = useRef(null)

  /* Draw on load, then the tag keeps ticking as ambient real-time proof */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const line = q('[data-line]')[0]
      const bench = q('[data-bench]')[0]
      const len = line.getTotalLength()
      const tl = gsap.timeline({ delay: 0.45 })
      tl.fromTo(
        line,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' },
      )
        .fromTo(
          bench,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: 'none' },
          0.35,
        )
        .fromTo(
          q('[data-dot]'),
          { scale: 0, transformOrigin: 'center' },
          { scale: 1, duration: 0.3, ease: SETTLE },
          '-=0.15',
        )
        .fromTo(
          q('[data-tag]'),
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: SETTLE },
          '<',
        )
    })
    return () => mm.revert()
  }, [])

  /* Looping % tick */
  useEffect(() => {
    const id = setInterval(() => {
      const delta = (Math.random() - 0.45) * 14
      setPrice((p) => Math.max(1000, p + delta))
      setPct((c) => +(c + delta / 200).toFixed(2))
      setDir(delta >= 0 ? 1 : -1)
      if (tagRef.current && motionOK()) {
        gsap.fromTo(tagRef.current, { scale: 1.04 }, { scale: 1, duration: 0.4, ease: SETTLE })
      }
    }, 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <div ref={root} className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" aria-hidden="true">
        {/* dotted benchmark trails behind */}
        <path
          data-bench
          d={`M0,${H * 0.86} C ${W * 0.35},${H * 0.72} ${W * 0.6},${H * 0.5} ${W},${H * 0.18}`}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth="1.5"
          strokeDasharray="2 7"
          opacity="0.7"
        />
        {/* the index line strokes left → right */}
        <path data-line d={lineD} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle data-dot cx={endX} cy={endY} r="4" fill="var(--ink)" />
      </svg>

      {/* price tag pops at the tip, then keeps ticking */}
      <div
        data-tag
        ref={tagRef}
        className="absolute rounded-lg bg-ink text-paper px-3.5 py-2 shadow-lg"
        style={{ left: '78%', top: `${(endY / H) * 100 - 16}%` }}
      >
        <div className="text-sm font-bold tabular-nums leading-tight">{fmtPrice(price)}</div>
        <div className={`text-[11px] font-bold tabular-nums leading-tight ${dir >= 0 ? 'text-up' : 'text-down'}`}>
          {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
        </div>
      </div>
    </div>
  )
}
