import { useEffect, useRef } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY } from '../lib/motion'
import CandleChart from '../components/CandleChart'

const CARDS = [
  { icon: 'chart-line', title: 'What We Offer', desc: 'BHnifty brings together everything a trader needs to track the Nifty ecosystem — live prices, interactive charts, and sector heat maps — all from a single dashboard.' },
  { icon: 'database', title: 'Our Technology', desc: 'Built on a modern, high-performance stack, BHnifty delivers real-time data with minimal lag and trusted market feeds, across desktop, tablet, and mobile.' },
  { icon: 'target', title: "Where We're Headed", desc: "We're just getting started. Upcoming features include smart alerts, AI-powered summaries, pattern recognition, and expanded support for multiple indices." },
]

export default function About() {
  const root = useRef(null)

  /* Badge & heading → story column → candles grow L→R → rope draws → walker fades in */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      gsap.from(q('[data-head] > *'), {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: SETTLE,
        stagger: 0.09,
        scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true },
      })
      gsap.from(q('[data-card]'), {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: SETTLE,
        stagger: 0.09,
        scrollTrigger: { trigger: q('[data-cards]')[0], start: 'top 85%', once: true },
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: q('[data-chart]')[0], start: 'top 78%', once: true },
      })
      tl.from(q('[data-candle]'), {
        scaleY: 0,
        duration: 0.35,
        ease: 'power2.out',
        stagger: 0.04,
      })
      const rope = q('[data-rope]')[0]
      if (rope) {
        const len = rope.getTotalLength()
        tl.fromTo(
          rope,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.2',
        )
      }
      tl.from(q('[data-walker]'), { opacity: 0, duration: 0.4, ease: 'none' })
      /* idle sway — ±1.5°, 4s loop */
      tl.to(q('[data-walker]'), {
        rotate: 1.5,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 100%',
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="about" ref={root} className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-6">
          <div data-head>
            <span className="inline-block uppercase tracking-[0.3em] text-[10.5px] font-bold text-ink-soft border border-rule rounded-full px-4 py-2">
              About Us
            </span>
            <h2 className="mt-6 font-serif font-semibold text-4xl md:text-6xl tracking-tight">Our Vision</h2>
            <p className="mt-6 text-ink-soft leading-[1.7] max-w-xl">
              BHnifty was built by traders, for traders. We realized that sector rotations in Nifty
              indices are the primary drivers of index moves, yet visual analytics for these
              constituents were spread across different services. BHnifty binds this statistical
              data into a single, cohesive, high-performance console.
            </p>
          </div>

          <div data-cards className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {CARDS.map((c) => (
              <div key={c.title} data-card className="rounded-xl border border-rule bg-panel p-5">
                <h3 className="font-bold text-[14.5px] text-ink">{c.title}</h3>
                <p className="mt-2 text-[12.5px] leading-[1.6] text-ink-soft">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* the one place candles appear — real colour is allowed here */}
        <div data-chart className="lg:col-span-6">
          <CandleChart className="w-full h-auto" />
        </div>
      </div>
    </section>
  )
}
