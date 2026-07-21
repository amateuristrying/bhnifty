import { useEffect, useRef } from 'react'
import { gsap, SETTLE, motionOK } from '../lib/motion'
import { fmtPrice } from '../lib/useLiveTicks'

const W = 640
const H = 340
const N = 46 // points across the width
const LO = 16
const HI = H - 16
const XS = Array.from({ length: N }, (_, i) => (i / (N - 1)) * W)
const TICK_MS = 2000 // one new candle of data every ~2s — calm, not frantic
const OPEN = 24500
const PRICE_SCALE = 7 // rupees per vertical px

/* Symmetric random walk with mild mean-reversion — goes down as readily as
   up, and never pins to an edge. y is in SVG space (smaller y = higher price). */
function walk(prev) {
  const r = Math.random() * 2 - 1 + (Math.random() * 2 - 1) // triangular, mean 0
  let y = prev + r * 15
  y += (H * 0.5 - y) * 0.03 // gentle pull to centre
  if (y < LO) y = LO + (LO - y)
  if (y > HI) y = HI - (y - HI)
  return Math.max(LO, Math.min(HI, y))
}

function seed() {
  const arr = [H * 0.5]
  for (let i = 1; i < N; i++) arr.push(walk(arr[i - 1]))
  return arr
}

const dOf = (vals) => 'M' + vals.map((y, i) => `${XS[i].toFixed(1)},${y.toFixed(1)}`).join(' L')
const priceOf = (y) => OPEN + (H / 2 - y) * PRICE_SCALE

export default function HeroChart() {
  const root = useRef(null)
  const lineRef = useRef(null)
  const dotRef = useRef(null)
  const tagRef = useRef(null)
  const priceRef = useRef(null)
  const pctRef = useRef(null)

  useEffect(() => {
    const q = gsap.utils.selector(root)
    const line = lineRef.current
    let vals = seed()
    line.setAttribute('d', dOf(vals))

    /* place the tip dot + floating tag at the rightmost value */
    function renderTip(y) {
      const dot = dotRef.current
      dot.setAttribute('cx', W)
      dot.setAttribute('cy', y.toFixed(1))
      const price = priceOf(y)
      const pct = ((price - OPEN) / OPEN) * 100
      if (priceRef.current) priceRef.current.textContent = fmtPrice(price)
      if (pctRef.current) {
        pctRef.current.textContent = `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`
        pctRef.current.className = `text-[11px] font-bold tabular-nums leading-tight ${
          pct >= 0 ? 'text-up' : 'text-down'
        }`
      }
      if (tagRef.current) {
        // tag rides just above the tip, clamped into view
        const topPct = Math.min(78, Math.max(2, (y / H) * 100 - 18))
        tagRef.current.style.top = `${topPct}%`
      }
    }
    renderTip(vals[N - 1])

    if (!motionOK()) {
      // static: draw benchmark dashed, show a resting line + tag
      return
    }

    const mm = gsap.matchMedia(root)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* 1 — the line strokes itself in left→right */
      const len = line.getTotalLength()
      const intro = gsap.timeline({ delay: 0.4 })
      intro
        .fromTo(
          line,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' },
        )
        .fromTo(q('[data-bench]'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.35)
        .fromTo(q('[data-dot]'), { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.3, ease: SETTLE }, '-=0.15')
        .fromTo(q('[data-tag]'), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: SETTLE }, '<')

      /* 2 — then it stays alive: every tick the series shifts one step left
         (morphing between states) and a fresh up-or-down value flows in */
      let streamer = null
      intro.eventCallback('onComplete', () => {
        line.setAttribute('stroke-dasharray', 'none')
        function step() {
          const next = vals.slice(1).concat(walk(vals[N - 1]))
          gsap.to(
            { t: 0 },
            {
              t: 1,
              duration: TICK_MS / 1000,
              ease: 'none',
              onUpdate() {
                const t = this.targets()[0].t
                const interp = vals.map((y, i) => y + (next[i] - y) * t)
                line.setAttribute('d', dOf(interp))
                renderTip(interp[N - 1])
              },
              onComplete() {
                vals = next
              },
            },
          )
        }
        streamer = setInterval(step, TICK_MS)
        step()
      })

      return () => {
        if (streamer) clearInterval(streamer)
        intro.kill()
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <div ref={root} className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" aria-hidden="true">
        {/* dotted benchmark trails quietly behind the live line */}
        <path
          data-bench
          d={`M0,${H * 0.86} C ${W * 0.35},${H * 0.72} ${W * 0.6},${H * 0.5} ${W},${H * 0.18}`}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth="1.5"
          strokeDasharray="2 7"
          opacity="0.7"
        />
        {/* the live index line — black */}
        <path ref={lineRef} data-line fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle ref={dotRef} data-dot r="4" fill="var(--ink)" />
      </svg>

      {/* price tag rides the tip, ticking up and down with the line */}
      <div
        data-tag
        ref={tagRef}
        className="absolute rounded-lg bg-ink text-paper px-3.5 py-2 shadow-lg"
        style={{ left: '74%', top: '20%' }}
      >
        <div ref={priceRef} className="text-sm font-bold tabular-nums leading-tight">
          {fmtPrice(OPEN)}
        </div>
        <div ref={pctRef} className="text-[11px] font-bold tabular-nums leading-tight text-up">
          ▲ 0.00%
        </div>
      </div>
    </div>
  )
}
