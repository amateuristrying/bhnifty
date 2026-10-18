import { useEffect, useRef, useState } from 'react'
import { gsap, SETTLE, motionOK } from '../../../lib/motion'
import { useQuote } from '../../../lib/market/provider'
import { useSelection } from '../selection'
import { fmtRupee, fmtPctPlain } from '../../../lib/format'
import Icon from '../../../components/Icon'

/*
 * Alerts live in memory for now — they arm against the live price and light up
 * the moment the condition is met, but nothing is persisted or pushed. The
 * broker's alert API replaces `addAlert` and the `armed` check below.
 */

const CONDITIONS = [
  { id: 'priceAbove', label: 'Price Above', unit: 'price', test: (q, t) => q.ltp >= t },
  { id: 'priceBelow', label: 'Price Below', unit: 'price', test: (q, t) => q.ltp <= t },
  { id: 'pctAbove', label: '% Change Above', unit: 'pct', test: (q, t) => q.changePct >= t },
  { id: 'pctBelow', label: '% Change Below', unit: 'pct', test: (q, t) => q.changePct <= t },
]

const byId = (id) => CONDITIONS.find((c) => c.id === id) ?? CONDITIONS[0]

function AlertRow({ alert, quote, onRemove }) {
  const cond = byId(alert.condition)
  const armed = cond.test(quote, alert.target)
  const target = cond.unit === 'price' ? fmtRupee(alert.target) : fmtPctPlain(alert.target)

  return (
    <li
      data-alert
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
        armed ? 'border-up bg-up-soft' : 'border-rule bg-paper'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-ink truncate">
          {cond.label} {target}
        </span>
        <span className="block text-[11.5px] text-ink-faint">
          {armed ? 'Condition met' : 'Watching'}
        </span>
      </span>
      <button
        type="button"
        onClick={() => onRemove(alert.id)}
        aria-label="Remove alert"
        className="shrink-0 text-ink-faint hover:text-down transition-colors cursor-pointer"
      >
        <Icon name="trash" className="w-4 h-4" />
      </button>
    </li>
  )
}

export default function AlertsCockpit({ symbol }) {
  const q = useQuote(symbol)
  const { alerts, addAlert, removeAlert } = useSelection()
  const [condition, setCondition] = useState('priceAbove')
  const [target, setTarget] = useState('')
  const listRef = useRef(null)

  const mine = alerts.filter((a) => a.sym === symbol)
  const unit = byId(condition).unit

  /* a new alert slides in at the top of the stack */
  useEffect(() => {
    if (!motionOK() || !listRef.current?.firstElementChild) return
    const tween = gsap.from(listRef.current.firstElementChild, {
      y: -8,
      opacity: 0,
      duration: 0.32,
      ease: SETTLE,
    })
    return () => tween.revert()
  }, [mine.length])

  function handleSubmit(e) {
    e.preventDefault()
    const value = Number(target)
    if (!Number.isFinite(value) || target === '') return
    addAlert({ sym: symbol, condition, target: value })
    setTarget('')
  }

  const fieldCls =
    'w-full rounded-lg border border-rule bg-paper px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors duration-150'
  const labelCls = 'block text-[12.5px] font-semibold text-ink-soft mb-1.5'

  return (
    <section data-card className="rounded-2xl border border-rule bg-panel p-5 md:p-6 flex flex-col">
      <header className="flex items-center gap-2.5 pb-4 border-b border-rule">
        <Icon name="bell" className="w-[18px] h-[18px] text-ink" />
        <h3 className="font-serif font-semibold text-[19px] tracking-tight">Alerts Cockpit</h3>
      </header>

      <form onSubmit={handleSubmit} className="pt-4">
        <label htmlFor="alert-condition" className={labelCls}>
          Alert Trigger Condition
        </label>
        <div className="relative">
          <select
            id="alert-condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className={`${fieldCls} appearance-none pr-10 cursor-pointer`}
          >
            {CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint"
          />
        </div>

        <label htmlFor="alert-target" className={`${labelCls} mt-4`}>
          {unit === 'price' ? 'Target Price (₹)' : 'Target Change (%)'}
        </label>
        <input
          id="alert-target"
          type="number"
          step="any"
          inputMode="decimal"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={unit === 'price' ? `e.g. ${q.ltp.toFixed(1)}` : 'e.g. 1.5'}
          className={fieldCls}
        />

        <button
          type="submit"
          disabled={target === ''}
          className="btn-lift mt-4 w-full inline-flex items-center justify-center gap-2 bg-ink text-paper text-[13.5px] font-bold h-11 rounded-lg disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Icon name="plus" className="w-4 h-4" />
          Create Alert
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-rule flex-1">
        <h4 className="text-[12.5px] font-semibold text-ink-soft">Active Tickers Alerts</h4>
        {mine.length === 0 ? (
          <p className="mt-4 text-center text-[13px] text-ink-faint">
            No active alerts set for {symbol}
          </p>
        ) : (
          <ul ref={listRef} className="mt-3 space-y-2">
            {mine.map((a) => (
              <AlertRow key={a.id} alert={a} quote={q} onRemove={removeAlert} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
