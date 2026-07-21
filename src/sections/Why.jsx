import { useEffect, useRef, useState } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY, ScrollTrigger } from '../lib/motion'
import Icon from '../components/Icon'

const VALUES = [
  { icon: 'monitor', title: 'One Dashboard', desc: 'No more switching between tabs. Analyze all 14 major stocks in one clean, responsive dashboard.' },
  { icon: 'chart-line', title: 'Professional Analytics', desc: 'Enjoy clean layouts, transaction stats, dynamic category balances, and real-time ledger records — all built for clarity and precision.' },
  { icon: 'database', title: 'Real-Time Data', desc: 'Ensure you make calculations based on direct, local and real-time database state synchronization for accurate insights.' },
  { icon: 'activity', title: 'Fast Decision Making', desc: 'Spot breakouts, rotative shifts, and outlier flows immediately via color-coded alerts and interactive charts.' },
  { icon: 'bell', title: 'Smart Alerts', desc: 'Set price, trendline, and breakout alerts, and get notified instantly via Telegram, WhatsApp, Email, or Push.' },
  { icon: 'target', title: 'Market Scanner', desc: 'Automatically scan every constituent stock for pricing anomalies, indicator crossovers, and circuit-level breaches in real time.' },
]

/* Positioning controls for the noir triptych — report the numbers you like
   and they get baked in as the defaults. */
const IMG_DEFAULT = { x: 0, y: 0, s: 1 }

function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="uppercase tracking-[0.22em] text-[10px] font-bold text-ink-soft">{label}</span>
        <span className="tabular-nums text-[11px] font-bold text-ink">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 appearance-none cursor-pointer rounded-full bg-rule accent-[#101010] dark:accent-[#f4f3f0]"
      />
    </label>
  )
}

export default function Why() {
  const root = useRef(null)
  const [img, setImg] = useState(IMG_DEFAULT)

  /* Thesis reads first → value list ladders in → panel wipes up + parallax */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      gsap.from(q('[data-thesis] > *'), {
        y: 18,
        opacity: 0,
        duration: 0.6,
        ease: SETTLE,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true },
      })
      gsap.from(q('[data-value]'), {
        y: 16,
        opacity: 0,
        duration: 0.5,
        ease: SETTLE,
        stagger: 0.08,
        scrollTrigger: { trigger: q('[data-values]')[0], start: 'top 82%', once: true },
      })
      /* image reveal — clip-path wipe up, then gentle scroll-linked drift */
      gsap.from(q('[data-panel-img]'), {
        clipPath: 'inset(100% 0% 0% 0%)',
        opacity: 0,
        duration: 0.7,
        ease: SETTLE,
        scrollTrigger: { trigger: q('[data-panel-img]')[0], start: 'top 80%', once: true },
      })
      gsap.to(q('[data-panel-img]'), {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: q('[data-panel-img]')[0],
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
      ScrollTrigger.refresh()
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="why-bhnifty" ref={root} className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-6">
          <div data-thesis>
            <h2 className="font-serif font-semibold text-4xl md:text-6xl tracking-tight">
              Why Choose BHnifty?
            </h2>
            <p className="mt-6 text-ink-soft leading-[1.7] max-w-xl">
              Standard trading setups require juggling multiple tabs, scattered tools, and
              inconsistent data — slowing you down when it matters most. BHnifty brings everything
              you need into one intelligent, real-time dashboard built for serious traders. From
              live market insights to smart alerts, we simplify complexity so you can focus on what
              truly matters — making better decisions, faster.
            </p>
          </div>

          <div data-values className="mt-10 space-y-7">
            {VALUES.map((v) => (
              <div key={v.title} data-value className="flex gap-5">
                <span className="shrink-0 inline-flex items-center justify-center w-13 h-13 rounded-full border border-rule bg-panel text-ink">
                  <Icon name={v.icon} className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-[15px] text-ink">{v.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-[1.6] text-ink-soft max-w-md">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* triptych position tuner */}
          <div className="mt-10 max-w-sm rounded-xl border border-rule bg-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-[0.24em] text-[10px] font-extrabold text-ink">
                Image Position
              </span>
              <button
                type="button"
                onClick={() => setImg(IMG_DEFAULT)}
                className="link-underline uppercase tracking-[0.18em] text-[9.5px] font-bold text-ink-faint hover:text-ink cursor-pointer"
              >
                Reset
              </button>
            </div>
            <Slider label="X" value={img.x} min={-300} max={300} step={1} display={`${img.x}px`} onChange={(x) => setImg((p) => ({ ...p, x }))} />
            <Slider label="Y" value={img.y} min={-300} max={300} step={1} display={`${img.y}px`} onChange={(y) => setImg((p) => ({ ...p, y }))} />
            <Slider label="Scale" value={img.s} min={0.4} max={2} step={0.01} display={`${img.s.toFixed(2)}×`} onChange={(s) => setImg((p) => ({ ...p, s }))} />
          </div>
        </div>

        {/* noir triptych — monochrome so it never fights the data colour */}
        <div className="lg:col-span-6 overflow-visible">
          <div data-panel-img className="btn-lift">
            <img
              src="/whychooseus.png"
              alt="Noir engravings of money, hustle and time"
              className="w-full h-auto"
              style={{
                transform: `translate(${img.x}px, ${img.y}px) scale(${img.s})`,
                transformOrigin: 'center',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
