import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, SETTLE, MOTION_QUERY, motionOK } from '../../lib/motion'
import { useIndex, useMarketClock } from '../../lib/market/provider'
import { BANKS, COMPANIES, RANGES } from '../../lib/market/universe'
import { fmtPrice, fmtChange, fmtPct, fmtClock, fmtCountdown } from '../../lib/format'
import Icon from '../../components/Icon'
import Ticker from '../components/Ticker'
import IndexChart from './IndexChart'
import MoversPanel from './MoversPanel'

const INDEX_KEY = 'NIFTY50'

function MarketStatus() {
  const { open, ist, label, until } = useMarketClock()
  return (
    <div className="text-left lg:text-right shrink-0">
      <div className="flex items-center lg:justify-end gap-2 text-[13.5px] font-bold text-ink">
        {label}
        <span
          className={`pulse-dot w-[7px] h-[7px] rounded-full ${open ? 'bg-up' : 'bg-down'}`}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 text-[13px] text-ink-soft">
        {open ? 'Closes in ' : 'Opens in '}
        <span className="font-bold text-ink tabular-nums">{fmtCountdown(until)}</span>
      </div>
      <div className="mt-0.5 text-[13px] text-ink-faint tabular-nums">{fmtClock(ist)} IST</div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="border-l-0 sm:border-l border-rule pl-0 sm:pl-6">
      <div className="uppercase tracking-[0.13em] text-[10.5px] font-bold text-ink-faint">
        {label}
      </div>
      <div className="mt-1.5 font-serif font-semibold text-[21px] md:text-[23px] tabular-nums">
        {fmtPrice(value)}
      </div>
    </div>
  )
}

export default function MarketOverview() {
  const root = useRef(null)
  const railRef = useRef(null)
  const inkRef = useRef(null)
  const [range, setRange] = useState('1D')
  const idx = useIndex(INDEX_KEY)
  const { open } = useMarketClock()

  const up = idx.change >= 0
  const priceFmt = useCallback((v) => fmtPrice(v), [])
  const changeFmt = useCallback((v) => fmtChange(v), [])

  /* the selected range keeps a single moving frame, like the sidebar rail */
  useEffect(() => {
    const btn = railRef.current?.querySelector(`[data-range="${range}"]`)
    if (!btn || !inkRef.current) return
    const first = inkRef.current.dataset.placed !== 'yes'
    gsap.to(inkRef.current, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: first || !motionOK() ? 0 : 0.34,
      ease: SETTLE,
    })
    inkRef.current.dataset.placed = 'yes'
  }, [range])

  /* everything above the fold settles in once, top-down */
  useEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const q = gsap.utils.selector(root)
      gsap
        .timeline()
        .from(q('[data-rise]'), { y: 18, opacity: 0, duration: 0.55, ease: SETTLE, stagger: 0.07 })
        .from(q('[data-stat]'), { y: 12, opacity: 0, duration: 0.45, ease: SETTLE, stagger: 0.06 }, '-=0.3')
        .from(q('[data-panel]'), { y: 22, opacity: 0, duration: 0.55, ease: SETTLE, stagger: 0.1 }, '-=0.2')
    })
    return () => mm.revert()
  }, [])

  return (
    <div ref={root}>
      {/* ── masthead ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div data-rise>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif font-semibold text-[34px] md:text-[42px] leading-none tracking-tight">
              Market Overview
            </h1>
            <Icon name="activity" className="w-5 h-5 text-ink" />
            <span className="inline-flex items-center gap-2 rounded-full bg-up-soft px-3 py-1 text-[12px] font-semibold text-ink">
              <span className="pulse-dot w-[7px] h-[7px] rounded-full bg-up" />
              Live
            </span>
          </div>
          <p className="mt-3 text-[14.5px] text-ink-soft">
            Real-time tracking of Nifty index constituents and pricing analytics.
          </p>
        </div>
        <div data-rise>
          <MarketStatus />
        </div>
      </div>

      {/* ── the index itself ─────────────────────────────────────────── */}
      <div className="mt-9 flex flex-col xl:flex-row xl:items-start gap-8 xl:gap-0">
        <div data-stat className="shrink-0 xl:pr-10">
          <div className="uppercase tracking-[0.13em] text-[10.5px] font-bold text-ink-faint">
            {idx.name}
          </div>
          <Ticker
            as="div"
            value={idx.ltp}
            format={priceFmt}
            className="mt-2 font-serif font-semibold text-[46px] md:text-[54px] leading-[1.05] tracking-tight tabular-nums"
          />
          <div
            className={`mt-1.5 flex items-center gap-1.5 text-[15px] font-bold tabular-nums ${
              up ? 'text-up' : 'text-down'
            }`}
          >
            <Ticker value={idx.change} format={changeFmt} />
            <span>({fmtPct(idx.changePct)})</span>
            <Icon name={up ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 flex-1 min-w-0">
          <div data-stat>
            <Stat label="Today's High" value={idx.high} />
          </div>
          <div data-stat>
            <Stat label="Today's Low" value={idx.low} />
          </div>
          <div data-stat>
            <Stat label="Prev. Close" value={idx.prevClose} />
          </div>
          <div data-stat>
            <Stat label="Opening Price" value={idx.open} />
          </div>
        </div>
      </div>

      {/* ── the session ──────────────────────────────────────────────── */}
      <div data-panel className="mt-8">
        <div ref={railRef} className="relative flex justify-start xl:justify-end gap-1 mb-2">
          <span
            ref={inkRef}
            className="absolute left-0 top-0 bottom-0 rounded-lg border border-rule bg-panel"
            aria-hidden="true"
          />
          {RANGES.map((r) => (
            <button
              key={r}
              data-range={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`relative z-10 px-4 py-2 rounded-lg text-[13px] transition-colors duration-150 cursor-pointer ${
                range === r ? 'text-ink font-bold' : 'text-ink-faint font-semibold hover:text-ink'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <IndexChart indexKey={INDEX_KEY} range={range} live={open} />
      </div>

      {/* ── the leaders ──────────────────────────────────────────────── */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoversPanel title="Top Banks" universe={BANKS} cta="View all banks" />
        <MoversPanel title="Top Nifty 50 Movers" universe={COMPANIES} cta="View all movers" />
      </div>
    </div>
  )
}
