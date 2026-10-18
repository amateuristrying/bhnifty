import { useEffect, useMemo, useRef } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY, motionOK } from '../../lib/motion'
import { useQuote } from '../../lib/market/provider'
import { fmtPctPlain, fmtWeight } from '../../lib/format'
import Icon from '../../components/Icon'
import Monogram from '../components/Monogram'
import { useSelection } from './selection'

/*
 * Weight maps. Block area is the index weight; block colour is today's move,
 * bucketed into five steps so the board reads at a glance instead of asking
 * the eye to interpolate a gradient.
 */

const BANDS = [
  { id: '2d', max: -1.5, bg: 'bg-heat-2d', fg: 'text-down', dot: 'bg-down', label: 'Strong Down (≤ -1.5%)' },
  { id: '1d', max: -0.2, bg: 'bg-heat-1d', fg: 'text-down', dot: 'bg-down/50', label: 'Mild Down (-1.5% to -0.2%)' },
  { id: '0', max: 0.2, bg: 'bg-heat-0', fg: 'text-ink-soft', dot: 'bg-ink-faint', label: 'Neutral (-0.2% to 0.2%)' },
  { id: '1u', max: 1.5, bg: 'bg-heat-1u', fg: 'text-up', dot: 'bg-up/50', label: 'Mild Up (0.2% to 1.5%)' },
  { id: '2u', max: Infinity, bg: 'bg-heat-2u', fg: 'text-up', dot: 'bg-up', label: 'Strong Up (≥ 1.5%)' },
]

const bandFor = (pct) => BANDS.find((b) => pct < b.max) ?? BANDS.at(-1)

function Tile({ sym, basis, dense }) {
  const q = useQuote(sym)
  const { symbol, select } = useSelection()
  const ref = useRef(null)
  const seen = useRef(q.seq)
  const band = bandFor(q.changePct)
  const active = symbol === sym

  /* a tick lights the tile's edge rather than moving it — the grid stays still */
  useEffect(() => {
    if (q.seq === seen.current) return
    seen.current = q.seq
    if (!motionOK()) return
    const tween = gsap.fromTo(
      ref.current,
      { borderColor: q.dir >= 0 ? 'var(--up)' : 'var(--down)' },
      /* settle back to whichever border this tile is meant to be wearing */
      { borderColor: active ? 'var(--ink)' : 'var(--rule)', duration: 0.75, ease: 'power2.out' },
    )
    return () => tween.revert()
  }, [q.seq, q.dir, active])

  /* the sparser map runs taller per tile so both cards fill the same row */
  return (
    <button
      ref={ref}
      data-tile
      type="button"
      onClick={() => select(sym)}
      aria-pressed={active}
      title={`${q.name} · ${fmtPctPlain(q.changePct)} · ${fmtWeight(q.weight)} of index — open in the analysis console`}
      style={{ flex: `1 1 ${basis}px` }}
      className={`heat-tile relative rounded-xl border px-2 text-center cursor-pointer ${band.bg} ${
        dense ? 'py-3.5' : 'py-6'
      } ${active ? 'border-ink' : 'border-rule'}`}
    >
      <Monogram text={q.short.slice(0, 2)} size="sm" className="mx-auto" />
      <div
        className={`mt-1.5 font-bold tracking-tight text-ink truncate ${
          dense ? 'text-[10px]' : 'text-[11.5px]'
        }`}
      >
        {q.short}
      </div>
      <div
        className={`mt-1 font-extrabold tabular-nums ${band.fg} ${
          dense ? 'text-[11px]' : 'text-[14px]'
        }`}
      >
        {fmtPctPlain(q.changePct)}
      </div>
      <div className={`mt-0.5 tabular-nums text-ink-faint ${dense ? 'text-[9.5px]' : 'text-[11px]'}`}>
        {fmtWeight(q.weight)}
      </div>
    </button>
  )
}

function Legend() {
  return (
    <div className="mt-5 pt-4 border-t border-rule flex flex-wrap gap-x-5 gap-y-2">
      {BANDS.map((b) => (
        <span key={b.id} className="inline-flex items-center gap-2 text-[10.5px] text-ink-faint">
          <span className={`w-2 h-2 rounded-full ${b.dot}`} />
          {b.label}
        </span>
      ))}
    </div>
  )
}

export default function HeatMap({ title, subtitle, universe, basis = 128, dense = false }) {
  const root = useRef(null)

  /* sorted heaviest-first, so the index's centre of gravity reads top-left */
  const symbols = useMemo(
    () => [...universe].sort((a, b) => b.weight - a.weight).map((i) => i.sym),
    [universe],
  )

  useEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true },
      })
      tl.from(q('[data-head]'), { y: 14, opacity: 0, duration: 0.5, ease: SETTLE }).from(
        q('[data-tile]'),
        {
          scale: 0.92,
          opacity: 0,
          duration: 0.4,
          ease: SETTLE,
          stagger: { each: 0.014, from: 'start' },
          clearProps: 'transform,opacity',
        },
        '-=0.25',
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <section
      ref={root}
      data-card
      className="rounded-2xl border border-rule bg-panel p-5 md:p-6 flex flex-col"
    >
      <header data-head className="flex items-center gap-4">
        <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
          <Icon name="grid-3x3" className="w-[22px] h-[22px]" />
        </span>
        <div className="min-w-0">
          <h2 className="font-serif font-semibold text-[21px] leading-tight tracking-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ink-faint">{subtitle}</p>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap gap-2.5 content-start flex-1">
        {symbols.map((sym) => (
          <Tile key={sym} sym={sym} basis={basis} dense={dense} />
        ))}
      </div>

      <Legend />
    </section>
  )
}
