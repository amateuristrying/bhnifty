import { useEffect, useRef } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY, motionOK } from '../lib/motion'
import Icon from '../components/Icon'
import Sparkline from '../components/Sparkline'
import useLiveTicks, { fmtPrice, fmtPct } from '../lib/useLiveTicks'

const LEDGER_INIT = [
  { sym: 'HDFCBANK', name: 'HDFC Bank', price: 1642.5, changePct: 1.45, dir: 1, spark: [4, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 16] },
  { sym: 'ICICIBANK', name: 'ICICI Bank', price: 1120.3, changePct: -0.35, dir: -1, spark: [14, 12, 13, 10, 11, 8, 10, 7, 9, 6, 8, 5] },
  { sym: 'SBIN', name: 'SBI Bank', price: 842.15, changePct: 2.1, dir: 1, spark: [3, 5, 4, 7, 6, 9, 8, 11, 12, 14, 15, 17] },
  { sym: 'AXISBANK', name: 'Axis Bank', price: 1075.8, changePct: 0.8, dir: 1, spark: [5, 7, 6, 8, 7, 9, 10, 9, 11, 12, 11, 13] },
]

const HEAT_INIT = [
  { sym: 'HDFCBANK', price: 1642.5, changePct: 1.45, dir: 1 },
  { sym: 'SBIN', price: 842.15, changePct: 2.1, dir: 1 },
  { sym: 'KOTAKBANK', price: 1842.15, changePct: -1.15, dir: -1 },
  { sym: 'PNB', price: 112.75, changePct: 0.0, dir: 0 },
  { sym: 'AXISBANK', price: 1075.8, changePct: 0.8, dir: 1 },
  { sym: 'ICICIBANK', price: 1120.3, changePct: -0.35, dir: -1 },
]

function LedgerRow({ r }) {
  const ref = useRef(null)
  const first = useRef(true)

  /* value flash — bg pulse, 600ms decay, green up / red down */
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!motionOK()) return
    gsap.fromTo(
      ref.current,
      { backgroundColor: r.dir >= 0 ? 'var(--up-soft)' : 'var(--down-soft)' },
      { backgroundColor: 'rgba(0,0,0,0)', duration: 0.6, ease: 'none' },
    )
  }, [r.flash]) // eslint-disable-line react-hooks/exhaustive-deps

  const up = r.changePct >= 0
  return (
    <div ref={ref} data-row className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1fr)_150px_auto] items-center gap-4 px-5 py-4 rounded-lg">
      <div>
        <div className="font-bold text-[14px] text-ink">{r.sym}</div>
        <div className="text-[12px] text-ink-faint">{r.name}</div>
      </div>
      <div className="hidden sm:block">
        <Sparkline data={r.spark} up={up} />
      </div>
      <div className="text-right">
        <div className="font-bold tabular-nums text-[14px] text-ink">{fmtPrice(r.price)}</div>
        <div className={`inline-flex items-center gap-1 text-[12.5px] font-bold tabular-nums ${up ? 'text-up' : 'text-down'}`}>
          <Icon name={up ? 'arrow-up-right' : 'arrow-down-right'} className="w-3 h-3" />
          {fmtPct(r.changePct)}
        </div>
      </div>
    </div>
  )
}

function HeatTile({ t }) {
  const ref = useRef(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!motionOK()) return
    gsap.fromTo(ref.current, { opacity: 0.55 }, { opacity: 1, duration: 0.6, ease: 'none' })
  }, [t.flash]) // eslint-disable-line react-hooks/exhaustive-deps

  const flat = Math.abs(t.changePct) < 0.005
  const up = t.changePct > 0
  return (
    <div
      ref={ref}
      data-tile
      className={`rounded-xl px-4 py-6 text-center transition-colors duration-300 ${
        flat
          ? 'bg-paper border border-rule text-ink'
          : up
            ? 'bg-up-soft text-up'
            : 'bg-down-soft text-down'
      }`}
    >
      <div className="font-bold text-[13px] tracking-wide">{t.sym}</div>
      <div className="mt-1 font-extrabold tabular-nums text-[17px]">{flat ? '0.00%' : fmtPct(t.changePct)}</div>
    </div>
  )
}

export default function Preview() {
  const root = useRef(null)
  const ledger = useLiveTicks(LEDGER_INIT)
  const heat = useLiveTicks(HEAT_INIT)

  /* Panels rise together; rows/tiles stagger in after the frame lands;
     sparklines stroke in coloured by direction */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      gsap.from(q('[data-title] > *'), {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: SETTLE,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true },
      })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: q('[data-panels]')[0], start: 'top 80%', once: true },
      })
      tl.from(q('[data-panel]'), { y: 24, opacity: 0, duration: 0.6, ease: SETTLE })
        .from(q('[data-row]'), { y: 10, opacity: 0, duration: 0.4, ease: SETTLE, stagger: 0.07 }, '-=0.2')
        .from(q('[data-tile]'), { y: 10, opacity: 0, duration: 0.4, ease: SETTLE, stagger: 0.07 }, '<')
      q('[data-spark-line]').forEach((p, i) => {
        const len = p.getTotalLength()
        tl.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' },
          0.4 + i * 0.07,
        )
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="preview" ref={root} className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 py-24 md:py-32">
        <div data-title className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif font-semibold text-4xl md:text-6xl tracking-tight">
            Professional Interface Preview
          </h2>
          <p className="mt-5 text-ink-soft leading-[1.6]">
            Take a look at the actual dashboards and modules built directly into the BHnifty core
            framework.
          </p>
        </div>

        <div data-panels className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Constituent Rates Ledger */}
          <div data-panel className="rounded-2xl border border-rule bg-panel p-6 md:p-8">
            <div className="uppercase tracking-[0.18em] text-[12px] font-extrabold text-ink">
              Live Constituent Rates Ledger
            </div>
            <p className="mt-1 text-[13px] text-ink-faint">Live changes across 14 sector Niftys</p>

            <div className="mt-5 rounded-xl border border-rule overflow-hidden">
              <div className="grid grid-cols-2 px-5 py-3 bg-paper border-b border-rule uppercase tracking-[0.14em] text-[10.5px] font-bold text-ink-faint">
                <span>Nifty Ticker</span>
                <span className="text-right">Price / Change</span>
              </div>
              <div className="divide-y divide-rule">
                {ledger.map((r) => (
                  <LedgerRow key={r.sym} r={r} />
                ))}
              </div>
            </div>
          </div>

          {/* Relative Sector Heatmap */}
          <div data-panel className="rounded-2xl border border-rule bg-panel p-6 md:p-8 flex flex-col">
            <div className="uppercase tracking-[0.18em] text-[12px] font-extrabold text-ink">
              Relative Sector Heatmap
            </div>
            <p className="mt-1 text-[13px] text-ink-faint">
              Visualize capital density distributions instantly
            </p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 content-start">
              {heat.map((t) => (
                <HeatTile key={t.sym} t={t} />
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-rule flex justify-between text-[13px] font-semibold text-ink-faint">
              <span>Updated: Real-time ticks</span>
              <span className="text-ink">14 stocks active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
