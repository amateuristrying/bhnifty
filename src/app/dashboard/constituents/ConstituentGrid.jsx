import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY, motionOK } from '../../../lib/motion'
import { useNudge } from '../../../lib/market/provider'
import { useWatchlist } from '../../../lib/watchlist'
import Icon from '../../../components/Icon'
import StockCard from './StockCard'

const MODES = [
  { id: 'auto', label: 'Auto', icon: 'sparkles' },
  { id: 'line', label: 'Line', icon: 'chart-line' },
  { id: 'candles', label: 'Candles', icon: 'candlestick-chart' },
]

function ModeRail({ value, onChange }) {
  const railRef = useRef(null)
  const pillRef = useRef(null)

  useLayoutEffect(() => {
    const btn = railRef.current?.querySelector(`[data-mode="${value}"]`)
    if (!btn || !pillRef.current) return
    const first = pillRef.current.dataset.placed !== 'yes'
    gsap.to(pillRef.current, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: first || !motionOK() ? 0 : 0.3,
      ease: SETTLE,
      autoAlpha: 1,
    })
    pillRef.current.dataset.placed = 'yes'
  }, [value])

  return (
    <div
      ref={railRef}
      className="relative flex items-center gap-0.5 rounded-lg border border-rule bg-panel p-1"
      role="group"
      aria-label="Chart style"
    >
      <span
        ref={pillRef}
        className="absolute left-0 top-1 bottom-1 rounded-md bg-ink invisible"
        aria-hidden="true"
      />
      {MODES.map((m) => (
        <button
          key={m.id}
          data-mode={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          aria-pressed={value === m.id}
          title={
            m.id === 'auto' ? 'Let each card pick the chart that suits its session' : `${m.label} charts`
          }
          className={`relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] transition-colors duration-150 cursor-pointer ${
            value === m.id ? 'text-paper font-bold' : 'text-ink-soft font-semibold hover:text-ink'
          }`}
        >
          <Icon name={m.icon} className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  )
}

export default function ConstituentGrid({ title, subtitle, universe, hint }) {
  const root = useRef(null)
  const spinRef = useRef(null)
  const [preference, setPreference] = useState('auto')
  const nudge = useNudge()
  const { symbols: watched, addMany } = useWatchlist()

  /* the board reads alphabetically — you look a bank up, you don't rank it */
  const symbols = useMemo(
    () => [...universe].sort((a, b) => a.name.localeCompare(b.name)).map((i) => i.sym),
    [universe],
  )

  const inList = symbols.filter((s) => watched.includes(s)).length
  const allWatched = inList === symbols.length

  useEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const sel = gsap.utils.selector(root)
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true } })
        .from(sel('[data-rise]'), { y: 14, opacity: 0, duration: 0.5, ease: SETTLE, stagger: 0.08 })
        .from(
          sel('[data-stock-card]'),
          {
            y: 18,
            opacity: 0,
            duration: 0.45,
            ease: SETTLE,
            stagger: { each: 0.05, from: 'start' },
            clearProps: 'transform,opacity',
          },
          '-=0.2',
        )
    })
    return () => mm.revert()
  }, [])

  const handleRefresh = useCallback(() => {
    nudge(symbols)
    if (!motionOK() || !spinRef.current) return
    gsap.fromTo(spinRef.current, { rotate: 0 }, { rotate: 360, duration: 0.7, ease: 'power2.inOut' })
  }, [nudge, symbols])

  return (
    <section ref={root}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div data-rise>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif font-semibold text-[30px] md:text-[36px] leading-tight tracking-tight">
              {title}
            </h2>
            <span title={hint} className="text-ink-faint cursor-help">
              <Icon name="info" className="w-[18px] h-[18px]" />
              <span className="sr-only">{hint}</span>
            </span>
          </div>
          <p className="mt-2.5 text-[14.5px] text-ink-soft">{subtitle}</p>
        </div>

        <div data-rise className="flex items-center gap-2 shrink-0">
          <ModeRail value={preference} onChange={setPreference} />

          <button
            type="button"
            onClick={() => addMany(symbols)}
            disabled={allWatched}
            title={
              allWatched
                ? 'Every constituent is already on your watchlist'
                : 'Add every constituent to your watchlist'
            }
            className="btn-lift inline-flex items-center gap-2 rounded-lg border border-rule bg-panel px-4 h-11 text-[13px] font-bold text-ink hover:border-ink disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
          >
            <Icon name="star" className="w-4 h-4" />
            <span className="hidden sm:inline">
              {allWatched ? 'In Watchlist' : 'Add to Watchlist'}
            </span>
            {inList > 0 && !allWatched && (
              <span className="text-ink-faint tabular-nums">
                {inList}/{symbols.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh prices"
            title="Refresh prices"
            className="btn-lift inline-flex items-center justify-center w-11 h-11 rounded-lg border border-rule bg-panel text-ink hover:border-ink cursor-pointer"
          >
            <span ref={spinRef} className="inline-flex">
              <Icon name="refresh-cw" className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {symbols.map((sym) => (
          <StockCard key={sym} sym={sym} preference={preference} />
        ))}
      </div>
    </section>
  )
}
