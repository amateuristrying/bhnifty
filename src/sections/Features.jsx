import { useEffect, useRef } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY } from '../lib/motion'
import RupeeCircuit, { ROWS } from '../components/RupeeCircuit'

const LEFT = [
  { title: 'Live Market Overview', desc: 'Get an instantaneous pulse of overall sector volumes, average spreads, and net cashflow trends.' },
  { title: '14 Nifty Live Monitoring', desc: 'Keep eyes on every major BankNifty constituent ticker simultaneously with real-time rate tables.' },
  { title: 'Interactive Charts', desc: 'Track historical lines, high-low candlesticks, and moving averages on high-fidelity visual cards.' },
  { title: 'Technical Indicators', desc: 'Analyze core technicals like RSI, MACD crossovers, and support/resistance lines on the fly.' },
  { title: 'Sector Heat Map', desc: 'Spot relative strength and weakness instantly through color-coded tiles based on intraday changes.' },
  { title: 'Market Movers', desc: 'Instantly isolate top gainers, losers, and outliers in volume spikes before they trigger breakouts.' },
]

const RIGHT = [
  { title: 'Fast Performance', desc: 'Ultra-lightweight React rendering and Mongoose index lookups deliver updates in milliseconds.' },
  { title: 'Responsive Dashboard', desc: 'Seamlessly shift from a dual-monitor desktop console to your tablet or mobile phone.' },
  { title: 'Smart Alerts', desc: 'Set price, trendline, and breakout alerts, and get notified instantly via Telegram, WhatsApp, Email, or Push notifications.' },
  { title: 'Market Scanner', desc: 'Automatically scan every constituent stock for pricing anomalies, indicator crossovers, and circuit-level breaches in real time.' },
  { title: 'Advanced Charting Tools', desc: 'Draw trendlines, Fibonacci retracements, and channels directly on professional multi-timeframe charts for deeper technical analysis.' },
  { title: 'Option Chain Analysis', desc: 'View live option chain data with open interest, PCR, and strike-wise analytics to gauge market sentiment and positioning.' },
]

function FeatureItem({ f, side }) {
  return (
    <div
      data-feature={side}
      className={`flex flex-col justify-center min-h-[86.5px] ${side === 'left' ? 'lg:text-right lg:items-end' : ''} border-l-2 border-rule pl-4 lg:border-l-0 lg:pl-0`}
    >
      <h3 className="font-bold text-[15px] text-ink">{f.title}</h3>
      <p className="mt-1.5 text-[13px] leading-[1.6] text-ink-soft max-w-[300px]">{f.desc}</p>
    </div>
  )
}

export default function Features() {
  const root = useRef(null)

  /* Scroll flow: title centres in → core powers on → connectors travel →
     features land as their connector arrives (left from left, right from right) */
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

      const circuitTl = gsap.timeline({
        scrollTrigger: { trigger: q('[data-circuit]')[0], start: 'top 78%', once: true },
      })
      circuitTl.from(q('[data-chip]'), {
        scale: 0.92,
        opacity: 0,
        transformOrigin: 'center',
        duration: 0.9,
        ease: SETTLE,
      })
      const connectors = q('[data-connector]')
      connectors.forEach((c, i) => {
        const len = c.getTotalLength()
        circuitTl.fromTo(
          c,
          { strokeDasharray: `${len}`, strokeDashoffset: len, opacity: 1 },
          {
            strokeDashoffset: 0,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => c.setAttribute('stroke-dasharray', '2 6'),
          },
          0.35 + (i % 6) * 0.06,
        )
      })
      circuitTl.from(q('[data-node]'), { scale: 0, transformOrigin: 'center', duration: 0.3, ease: SETTLE, stagger: 0.04 }, 0.6)
      circuitTl.from(
        q('[data-feature="left"]'),
        { x: -14, opacity: 0, duration: 0.4, ease: SETTLE, stagger: 0.07 },
        0.5,
      )
      circuitTl.from(
        q('[data-feature="right"]'),
        { x: 14, opacity: 0, duration: 0.4, ease: SETTLE, stagger: 0.07 },
        0.56,
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="features" ref={root} className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 py-24 md:py-32">
        <div data-title className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif font-semibold text-4xl md:text-6xl tracking-tight">
            Engineered for Modern Nifty Trading.
          </h2>
          <p className="mt-5 text-ink-soft leading-[1.6]">
            Gain an edge over other traders by monitoring the entire Nifty ecosystem with these
            custom indicators and widgets.
          </p>
        </div>

        {/* whitespace is the grid — no cards */}
        <div data-circuit className="mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-[1fr_460px_1fr] gap-x-6 gap-y-8 items-center">
          <div className="order-2 lg:order-1 grid gap-y-8 lg:gap-y-0" style={{ gridAutoRows: 'min-content' }}>
            {LEFT.map((f) => (
              <FeatureItem key={f.title} f={f} side="left" />
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <RupeeCircuit className="w-full h-auto max-w-[300px] mx-auto lg:max-w-none" />
          </div>

          <div className="order-3 grid gap-y-8 lg:gap-y-0" style={{ gridAutoRows: 'min-content' }}>
            {RIGHT.map((f) => (
              <FeatureItem key={f.title} f={f} side="right" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
