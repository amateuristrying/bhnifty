import { useEffect, useRef } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY, ScrollTrigger, revealHeadline, scrubWords } from '../lib/motion'
import Icon from '../components/Icon'

const THESIS_WORDS = "Standard trading setups require juggling multiple tabs, scattered tools, and inconsistent data — slowing you down when it matters most. BHnifty brings everything you need into one intelligent, real-time dashboard built for serious traders. From live market insights to smart alerts, we simplify complexity so you can focus on what truly matters — making better decisions, faster.".split(" ")

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

  /* Thesis reads first → value list ladders in → panel wipes up + parallax */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      revealHeadline(q('[data-thesis] h2'), { y: 38, rotateX: 12 })
      scrubWords(q('[data-scrub-thesis]')[0])

      gsap.from(q('[data-value]'), {
        y: 24,
        opacity: 0,
        filter: 'blur(4px)',
        duration: 0.6,
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
            <p data-scrub-thesis className="mt-6 text-ink leading-[1.75] text-[16px] max-w-xl">
              {THESIS_WORDS.map((w, i) => (
                <span key={i} data-scrub-word className="inline-block mr-1.5 opacity-20 transition-opacity">
                  {w}
                </span>
              ))}
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

        {/* noir triptych — monochrome so it never fights the data colour */}
        <div className="lg:col-span-6 overflow-visible">
          <div data-panel-img className="btn-lift">
            <img
              src="/whychooseus.png"
              alt="Noir engravings of money, hustle and time"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
