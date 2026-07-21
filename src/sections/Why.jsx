import { useEffect, useRef } from 'react'
import { gsap, SETTLE, REVEAL_START, ScrollTrigger, MOTION_QUERY } from '../lib/motion'
import Icon from '../components/Icon'
import Placeholder from '../components/Placeholder'

const VALUES = [
  { icon: 'monitor', title: 'One Dashboard', desc: 'No more switching between tabs. Analyze all 14 major stocks in one clean, responsive dashboard.' },
  { icon: 'chart-line', title: 'Professional Analytics', desc: 'Enjoy clean layouts, transaction stats, dynamic category balances, and real-time ledger records — all built for clarity and precision.' },
  { icon: 'database', title: 'Real-Time Data', desc: 'Ensure you make calculations based on direct, local and real-time database state synchronization for accurate insights.' },
  { icon: 'activity', title: 'Fast Decision Making', desc: 'Spot breakouts, rotative shifts, and outlier flows immediately via color-coded alerts and interactive charts.' },
  { icon: 'bell', title: 'Smart Alerts', desc: 'Set price, trendline, and breakout alerts, and get notified instantly via Telegram, WhatsApp, Email, or Push.' },
  { icon: 'target', title: 'Market Scanner', desc: 'Automatically scan every constituent stock for pricing anomalies, indicator crossovers, and circuit-level breaches in real time.' },
]

export default function Why() {
  const root = useRef(null)

  /* Thesis reads first → value list ladders in → panels parallax (centre lags) */
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
      /* image reveal — clip-path wipe up */
      gsap.from(q('[data-panel-img]'), {
        clipPath: 'inset(100% 0% 0% 0%)',
        opacity: 0,
        duration: 0.7,
        ease: SETTLE,
        stagger: 0.12,
        scrollTrigger: { trigger: q('[data-panels]')[0], start: 'top 80%', once: true },
      })
      /* scroll-linked parallax ±18px, centre offset for depth */
      q('[data-panel-img]').forEach((el, i) => {
        gsap.to(el, {
          y: i === 1 ? 18 : -18,
          ease: 'none',
          scrollTrigger: { trigger: q('[data-panels]')[0], start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      ScrollTrigger.refresh()
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="why-bhnifty" ref={root} className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14">
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
        </div>

        {/* three tall noir illustration panels — final assets to be supplied */}
        <div data-panels className="lg:col-span-6 grid grid-cols-3 gap-5 items-center content-center">
          <div data-panel-img className="btn-lift">
            <Placeholder label="NOIR I" ratio="9 / 16" />
          </div>
          <div data-panel-img className="btn-lift">
            <Placeholder label="NOIR II" ratio="9 / 16" />
          </div>
          <div data-panel-img className="btn-lift">
            <Placeholder label="NOIR III" ratio="9 / 16" />
          </div>
        </div>
      </div>
    </section>
  )
}
