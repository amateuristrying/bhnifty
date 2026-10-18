import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY, motionOK } from '../../../lib/motion'
import { useQuote } from '../../../lib/market/provider'
import { TIMEFRAMES, EXCHANGE } from '../../../lib/market/universe'
import { fmtRupee, fmtPct } from '../../../lib/format'
import Icon from '../../../components/Icon'
import Monogram from '../../components/Monogram'
import Ticker from '../../components/Ticker'
import { useSelection } from '../selection'
import MetricsSummary from './MetricsSummary'
import AlertsCockpit from './AlertsCockpit'
import NewsFeed from './NewsFeed'

/* Technical overlays. Two are on out of the box — the rest are opt-in. */
const INDICATORS = [
  { id: 'levels', label: 'Support & Resistance' },
  { id: 'range52', label: '52-Week Range' },
  { id: 'vwap', label: 'VWAP' },
  { id: 'dayRange', label: 'Day Range' },
]

const DEFAULT_INDICATORS = { levels: true, range52: true, vwap: false, dayRange: false }

function IndicatorsMenu({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const panelRef = useRef(null)
  const active = INDICATORS.filter((i) => value[i.id]).length

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open || !panelRef.current || !motionOK()) return
    const tl = gsap
      .timeline()
      .fromTo(
        panelRef.current,
        { y: -8, opacity: 0, scaleY: 0.96, transformOrigin: 'top left' },
        { y: 0, opacity: 1, scaleY: 1, duration: 0.24, ease: SETTLE },
      )
      .fromTo(
        panelRef.current.querySelectorAll('[data-indicator]'),
        { opacity: 0, y: -4 },
        { opacity: 1, y: 0, duration: 0.2, stagger: 0.04, ease: SETTLE },
        '-=0.12',
      )
    return () => tl.revert()
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2.5 rounded-lg border border-rule bg-paper px-4 h-11 text-[13.5px] font-semibold text-ink hover:border-ink transition-colors duration-150 cursor-pointer"
      >
        <Icon name="sliders-horizontal" className="w-4 h-4" />
        Indicators ({active} active)
        <Icon
          name="chevron-down"
          className={`w-4 h-4 text-ink-faint transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          className="absolute left-0 top-[calc(100%+8px)] z-30 w-64 rounded-xl border border-rule bg-panel shadow-xl overflow-hidden"
        >
          {INDICATORS.map((ind) => (
            <button
              key={ind.id}
              data-indicator
              role="menuitemcheckbox"
              aria-checked={!!value[ind.id]}
              onClick={() => onChange({ ...value, [ind.id]: !value[ind.id] })}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13.5px] font-semibold text-ink hover:bg-paper transition-colors text-left cursor-pointer"
            >
              <span
                className={`shrink-0 inline-flex items-center justify-center w-[18px] h-[18px] rounded border ${
                  value[ind.id] ? 'bg-ink border-ink text-paper' : 'border-rule text-transparent'
                }`}
              >
                <Icon name="check" className="w-3 h-3" strokeWidth="3" />
              </span>
              {ind.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TimeframeRail({ value, onChange }) {
  const railRef = useRef(null)
  const pillRef = useRef(null)

  /* the same moving frame the range rail and the sections rail use */
  useLayoutEffect(() => {
    const btn = railRef.current?.querySelector(`[data-tf="${value}"]`)
    if (!btn || !pillRef.current) return
    const first = pillRef.current.dataset.placed !== 'yes'
    gsap.to(pillRef.current, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: first || !motionOK() ? 0 : 0.32,
      ease: SETTLE,
      autoAlpha: 1,
    })
    pillRef.current.dataset.placed = 'yes'
  }, [value])

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="hidden sm:block shrink-0 uppercase tracking-[0.16em] text-[10.5px] font-bold text-ink-faint">
        Timeframe:
      </span>
      <div
        ref={railRef}
        className="relative flex items-center gap-0.5 rounded-lg border border-rule bg-paper p-1 overflow-x-auto no-scrollbar"
      >
        <span
          ref={pillRef}
          className="absolute left-0 top-1 bottom-1 rounded-md bg-ink invisible"
          aria-hidden="true"
        />
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            data-tf={tf}
            type="button"
            onClick={() => onChange(tf)}
            aria-pressed={value === tf}
            className={`relative z-10 shrink-0 px-3 py-1.5 rounded-md text-[12.5px] transition-colors duration-150 cursor-pointer ${
              value === tf ? 'text-paper font-bold' : 'text-ink-soft font-semibold hover:text-ink'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AnalysisConsole() {
  const root = useRef(null)
  const bodyRef = useRef(null)
  const { symbol, back, canGoBack, consoleRef } = useSelection()
  const [timeframe, setTimeframe] = useState('1D')
  const [indicators, setIndicators] = useState(DEFAULT_INDICATORS)
  const q = useQuote(symbol)

  const priceFmt = useCallback((v) => fmtRupee(v), [])

  /* the section reveals once, like the maps above it */
  useEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const sel = gsap.utils.selector(root)
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true } })
        .from(sel('[data-rise]'), { y: 16, opacity: 0, duration: 0.5, ease: SETTLE, stagger: 0.08 })
        .from(sel('[data-card]'), { y: 20, opacity: 0, duration: 0.5, ease: SETTLE, stagger: 0.09 }, '-=0.2')
    })
    return () => mm.revert()
  }, [])

  /* switching instrument re-deals the body so the change is legible */
  useEffect(() => {
    if (!motionOK() || !bodyRef.current) return
    const tween = gsap.from(bodyRef.current, { opacity: 0, y: 10, duration: 0.35, ease: SETTLE })
    return () => tween.revert()
  }, [symbol])

  if (!q) return null

  const up = q.changePct >= 0

  return (
    <section
      ref={(node) => {
        root.current = node
        consoleRef.current = node
      }}
      /* clears the sticky header when a tile scrolls this into view */
      className="scroll-mt-[116px]"
    >
      <div data-rise>
        <h2 className="font-serif font-semibold text-[30px] md:text-[36px] leading-tight tracking-tight">
          Expanded Analysis Console
        </h2>
        <p className="mt-2.5 text-[14.5px] text-ink-soft">
          Click any stock card or heatmap block below to review detailed charts &amp; technicals.
        </p>
      </div>

      <div ref={bodyRef}>
        {/* the instrument under the glass */}
        <div data-rise className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
          <button
            type="button"
            onClick={back}
            disabled={!canGoBack}
            aria-label="Back to the previously viewed instrument"
            title={canGoBack ? 'Back to the previous instrument' : 'Nothing to go back to'}
            className="btn-lift shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg border border-rule bg-panel text-ink hover:border-ink disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
          </button>

          <Monogram text={q.short.slice(0, 4)} />

          <div className="min-w-0">
            <h3 className="font-serif font-semibold text-[26px] md:text-[30px] leading-tight tracking-tight truncate">
              {q.name}
            </h3>
            <div className="mt-0.5 text-[12.5px] tracking-[0.06em] text-ink-faint">
              {q.sym} <span className="mx-1.5">•</span> {EXCHANGE}
            </div>
          </div>

          <div className="ml-auto text-right shrink-0">
            <Ticker
              as="div"
              value={q.ltp}
              format={priceFmt}
              className="font-serif font-semibold text-[26px] md:text-[30px] leading-tight tabular-nums"
            />
            <div
              className={`mt-0.5 inline-flex items-center gap-1.5 text-[13.5px] font-bold tabular-nums ${
                up ? 'text-up' : 'text-down'
              }`}
            >
              {fmtPct(q.changePct)}
              <Icon name={up ? 'arrow-up-right' : 'arrow-down-right'} className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* what the readouts are measuring */}
        <div
          data-rise
          className="mt-6 rounded-2xl border border-rule bg-panel px-4 md:px-5 py-4 flex flex-wrap items-center justify-between gap-4"
        >
          <IndicatorsMenu value={indicators} onChange={setIndicators} />
          <TimeframeRail value={timeframe} onChange={setTimeframe} />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MetricsSummary symbol={symbol} timeframe={timeframe} indicators={indicators} />
          <AlertsCockpit symbol={symbol} />
          <NewsFeed />
        </div>
      </div>
    </section>
  )
}
