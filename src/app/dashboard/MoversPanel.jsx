import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, SETTLE, motionOK } from '../../lib/motion'
import { useQuote, useRanked } from '../../lib/market/provider'
import { fmtPrice, fmtPct, fmtVolume } from '../../lib/format'
import Icon from '../../components/Icon'
import Monogram from '../components/Monogram'
import { useSelection } from './selection'

const TABS = [
  { id: 'gainers', label: 'Top Gainers', by: 'changePct', dir: 'desc' },
  { id: 'losers', label: 'Top Losers', by: 'changePct', dir: 'asc' },
  { id: 'volume', label: 'Top Volume', by: 'volume', dir: 'desc' },
]

function Row({ sym, showVolume }) {
  const q = useQuote(sym)
  const { symbol, select } = useSelection()
  const ref = useRef(null)
  const seen = useRef(q.seq)
  const active = symbol === sym

  /* value flash — the same language the marketing ledger speaks */
  useEffect(() => {
    if (q.seq === seen.current) return
    seen.current = q.seq
    if (!motionOK()) return
    const tween = gsap.fromTo(
      ref.current,
      { backgroundColor: q.dir >= 0 ? 'var(--up-soft)' : 'var(--down-soft)' },
      /* settle back to the row's resting fill, selected or not */
      {
        backgroundColor: active ? 'var(--paper)' : 'rgba(0,0,0,0)',
        duration: 0.7,
        ease: 'none',
      },
    )
    return () => tween.revert()
  }, [q.seq, q.dir, active])

  const up = q.changePct >= 0

  return (
    <button
      ref={ref}
      data-row
      type="button"
      onClick={() => select(sym)}
      aria-pressed={active}
      title={`Open ${q.name} in the analysis console`}
      className={`w-full text-left flex items-center gap-3.5 px-3 py-3.5 rounded-lg border-b border-rule last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-paper ${
        active ? 'bg-paper' : ''
      }`}
    >
      <Monogram text={q.short} />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-semibold text-ink truncate">{q.name}</div>
        <div className="text-[11.5px] tracking-[0.06em] text-ink-faint truncate">{q.sym}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-serif font-semibold text-[16px] tabular-nums text-ink">
          {fmtPrice(q.ltp)}
        </div>
        {showVolume ? (
          <div className="text-[12px] font-semibold tabular-nums text-ink-faint">
            {fmtVolume(q.volume)}
          </div>
        ) : (
          <div
            className={`inline-flex items-center gap-1 text-[12.5px] font-bold tabular-nums ${
              up ? 'text-up' : 'text-down'
            }`}
          >
            <Icon name={up ? 'arrow-up-right' : 'arrow-down-right'} className="w-3 h-3" />
            {fmtPct(q.changePct)}
          </div>
        )}
      </div>
    </button>
  )
}

export default function MoversPanel({ title, universe, cta, ctaTo = '/app/scanner', limit = 3 }) {
  const [tab, setTab] = useState('gainers')
  const stripRef = useRef(null)
  const inkRef = useRef(null)
  const rowsRef = useRef(null)

  const active = TABS.find((t) => t.id === tab)
  const symbols = useMemo(() => universe.map((i) => i.sym), [universe])
  const ranked = useRanked(symbols, { by: active.by, dir: active.dir, limit })

  /* the underline slides between tabs; it is the same rule, moved */
  useLayoutEffect(() => {
    const btn = stripRef.current?.querySelector(`[data-tab="${tab}"]`)
    if (!btn || !inkRef.current) return
    const first = inkRef.current.dataset.placed !== 'yes'
    gsap.to(inkRef.current, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: first || !motionOK() ? 0 : 0.35,
      ease: SETTLE,
    })
    inkRef.current.dataset.placed = 'yes'
  }, [tab])

  /* rows re-deal when the tab changes */
  useEffect(() => {
    if (!motionOK() || !rowsRef.current) return
    const tween = gsap.from(rowsRef.current.querySelectorAll('[data-row]'), {
      y: 10,
      opacity: 0,
      duration: 0.38,
      ease: SETTLE,
      stagger: 0.06,
    })
    /* revert restores the rows; kill would strand them mid-fade */
    return () => tween.revert()
  }, [tab])

  return (
    <section data-panel className="rounded-2xl border border-rule bg-panel p-5 md:p-6 flex flex-col">
      <h2 className="font-serif font-semibold text-[22px] tracking-tight">{title}</h2>

      <div ref={stripRef} className="relative mt-4 flex items-center gap-6 border-b border-rule overflow-x-auto no-scrollbar">
        <span ref={inkRef} className="absolute left-0 bottom-0 h-[2px] bg-ink" aria-hidden="true" />
        {TABS.map((t) => (
          <button
            key={t.id}
            data-tab={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`relative shrink-0 pb-2.5 text-[13.5px] transition-colors duration-150 cursor-pointer ${
              tab === t.id ? 'text-ink font-bold' : 'text-ink-faint font-semibold hover:text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div ref={rowsRef} className="mt-2 flex-1">
        {ranked.map((sym) => (
          <Row key={sym} sym={sym} showVolume={tab === 'volume'} />
        ))}
      </div>

      <Link
        to={ctaTo}
        className="btn-lift mt-3 self-end inline-flex items-center gap-2 text-[13px] font-bold text-ink"
      >
        {cta}
        <Icon name="arrow-right" data-arrow className="w-4 h-4" />
      </Link>
    </section>
  )
}
