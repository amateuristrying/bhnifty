import { useEffect, useRef } from 'react'
import { gsap, motionOK } from '../../../lib/motion'
import { useQuote, useStockSeries, useStockCandles } from '../../../lib/market/provider'
import { istNow } from '../../../lib/market/clock'
import { fmtPrice, fmtPctPlain, fmtVolume, fmtClock } from '../../../lib/format'
import Icon from '../../../components/Icon'
import Monogram from '../../components/Monogram'
import { useSelection } from '../selection'
import { useWatchlist } from '../../../lib/watchlist'
import MiniChart from './MiniChart'

/*
 * In `auto` each card wears the chart that suits its session — the store
 * decides that once, at seed, so a live tick can never flip a card from a line
 * to candles under the reader. The section's rail overrides every card.
 */
const chartModeFor = (q, preference) => (preference === 'auto' ? q.chart : preference)

function Stat({ label, value, tone = '' }) {
  return (
    <div className="min-w-0">
      <div className="uppercase tracking-[0.08em] text-[8.5px] font-bold text-ink-faint">
        {label}
      </div>
      <div className={`mt-0.5 text-[10.5px] font-semibold tabular-nums truncate ${tone}`}>
        {value}
      </div>
    </div>
  )
}

export default function StockCard({ sym, preference }) {
  const q = useQuote(sym)
  const { symbol, select } = useSelection()
  const { has, toggle } = useWatchlist()
  const priceRef = useRef(null)
  const seen = useRef(q.seq)

  const mode = chartModeFor(q, preference)
  /* both are cheap and memoised; only the one in use is read */
  const values = useStockSeries(sym, 42)
  const candles = useStockCandles(sym, 17)

  const up = q.changePct >= 0
  const flat = Math.abs(q.changePct) < 0.005
  const starred = has(sym)
  const active = symbol === sym

  /* the price flashes its direction on every tick */
  useEffect(() => {
    if (q.seq === seen.current) return
    seen.current = q.seq
    if (!motionOK() || !priceRef.current) return
    const tween = gsap.fromTo(
      priceRef.current,
      { color: q.dir >= 0 ? 'var(--up)' : 'var(--down)' },
      { color: 'var(--ink)', duration: 0.7, ease: 'power2.out' },
    )
    return () => tween.revert()
  }, [q.seq, q.dir])

  const pill = flat
    ? 'bg-heat-0 text-ink-soft'
    : up
      ? 'bg-up-soft text-up'
      : 'bg-down-soft text-down'

  return (
    <article
      data-stock-card
      className={`relative rounded-2xl border bg-panel p-4 transition-colors duration-150 hover:border-ink/40 ${
        active ? 'border-ink' : 'border-rule'
      }`}
    >
      {/* the whole card selects; the star sits above it */}
      <button
        type="button"
        onClick={() => select(sym)}
        aria-label={`Open ${q.name} in the analysis console`}
        className="absolute inset-0 z-0 rounded-2xl cursor-pointer"
      />

      <button
        type="button"
        onClick={() => toggle(sym)}
        aria-pressed={starred}
        aria-label={starred ? `Remove ${q.name} from watchlist` : `Add ${q.name} to watchlist`}
        title={starred ? 'Remove from watchlist' : 'Add to watchlist'}
        className={`absolute top-3 left-3 z-20 p-1 rounded transition-colors cursor-pointer ${
          starred ? 'text-accent' : 'text-ink-faint hover:text-ink'
        }`}
      >
        <Icon name="star" className="w-3.5 h-3.5" fill={starred ? 'currentColor' : 'none'} />
      </button>

      <div className="relative z-10 pointer-events-none">
        <div className="mt-5 flex items-start gap-2.5">
          <Monogram text={q.short.slice(0, 4)} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold text-ink leading-tight truncate">{q.name}</h3>
            <p className="mt-0.5 text-[10px] tracking-[0.06em] text-ink-faint truncate">{q.sym}</p>
          </div>
          <div className="shrink-0 text-right">
            <div
              ref={priceRef}
              className="text-[15px] font-serif font-semibold tabular-nums leading-tight"
            >
              {fmtPrice(q.ltp)}
            </div>
            <span
              className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums ${pill}`}
            >
              {fmtPctPlain(q.changePct)}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <MiniChart
            mode={mode}
            values={values}
            candles={candles}
            up={up}
            id={`spark-${sym.replace(/[^a-z0-9]/gi, '')}`}
          />
        </div>

        <div className="mt-3 pt-3 border-t border-rule grid grid-cols-5 gap-1.5">
          <Stat label="Open" value={fmtPrice(q.open)} />
          <Stat label="High" value={fmtPrice(q.high)} tone="text-up" />
          <Stat label="Low" value={fmtPrice(q.low)} tone="text-down" />
          <Stat label="Volume" value={fmtVolume(q.volume)} />
          <Stat label="Updated" value={fmtClock(istNow(q.ts))} />
        </div>
      </div>
    </article>
  )
}
