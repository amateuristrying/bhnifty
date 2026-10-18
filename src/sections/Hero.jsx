import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, SETTLE, MOTION_QUERY } from '../lib/motion'
import Icon from '../components/Icon'
import HeroChart from '../components/HeroChart'
import AmbientField from '../components/AmbientField'

const STRIP = [
  { icon: 'target', label: 'Live Constituent Data' },
  { icon: 'chart-column', label: 'Interactive Charts' },
  { icon: 'bell', label: 'Real-time Alerts' },
  { icon: 'grid-3x3', label: 'Market Heatmaps' },
]

export default function Hero({ isDark }) {
  const root = useRef(null)

  /* Entry flow: eyebrow → serif lines rise with 3D perspective → subtitle blur-rise
     → actions fade up → capability strip staggers along the bottom rule.
     Scroll flow: gentle parallax drift as user scrolls down. */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from(q('[data-eyebrow]'), { y: 20, opacity: 0, duration: 0.6, ease: SETTLE })
        .from(
          q('[data-hero-line]'),
          { y: 36, opacity: 0, rotateX: 18, transformOrigin: '0% 100%', duration: 0.85, ease: SETTLE, stagger: 0.1 },
          '-=0.3',
        )
        .from(q('[data-sub]'), { y: 20, opacity: 0, filter: 'blur(5px)', duration: 0.7, ease: SETTLE }, '-=0.4')
        .from(q('[data-cta]'), { y: 16, opacity: 0, duration: 0.5, ease: SETTLE, stagger: 0.08 }, '-=0.3')
        .from(q('[data-quote]'), { opacity: 0, y: 12, filter: 'blur(4px)', duration: 0.8, ease: SETTLE }, '-=0.2')
        .from(
          q('[data-strip-item]'),
          { y: 16, opacity: 0, duration: 0.6, ease: SETTLE, stagger: 0.08 },
          '-=0.4',
        )

      /* Scroll parallax scrub for typography on scroll */
      gsap.to(q('[data-hero-content]'), {
        y: -40,
        opacity: 0.75,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="hero" ref={root} className="relative border-b border-rule">
      <div className="relative mx-auto max-w-[1320px] px-6 md:px-10 pt-16 md:pt-24 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center overflow-hidden">
        {/* living paper — three.js dot field on the chart side */}
        <AmbientField isDark={isDark} className="hidden lg:block inset-y-0 right-0 w-1/2" opacity={0.18} />

        <div data-hero-content className="lg:col-span-6 relative z-10">
          <p data-eyebrow className="uppercase tracking-[0.34em] text-[11px] font-bold text-ink-soft">
            Real-time Constituent Monitoring
          </p>

          <h1 className="font-serif font-semibold text-ink mt-7 text-5xl md:text-6xl xl:text-[68px] leading-[1.08] tracking-tight">
            <span data-hero-line className="block">Monitor the entire</span>
            <span data-hero-line className="block">Nifty sector from</span>
            <span data-hero-line className="block italic">one dashboard.</span>
          </h1>

          <p data-sub className="mt-7 max-w-md text-ink-soft leading-[1.6]">
            Live prices, interactive charts, heatmaps, and real-time alerts — everything you need to
            stay ahead of the market.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              data-cta
              to="/login"
              className="btn-lift inline-flex items-center gap-3 bg-ink text-paper uppercase tracking-[0.28em] text-[11px] font-bold px-7 h-13 rounded-lg"
            >
              Explore Dashboard
              <Icon name="arrow-right" data-arrow className="w-3.5 h-3.5" />
            </Link>
            <a
              data-cta
              href="#features"
              className="btn-lift inline-flex items-center bg-transparent border border-ink/25 text-ink uppercase tracking-[0.28em] text-[11px] font-bold px-7 h-13 rounded-lg hover:border-ink"
            >
              View Features
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 relative z-10">
          <HeroChart />
          <p data-quote className="mt-10 text-center text-ink-soft italic text-[15px]">
            &ldquo;Make money, so you can walk away from situations you don&rsquo;t like.&rdquo;
          </p>
        </div>
      </div>

      {/* quiet capability strip beneath */}
      <div className="border-t border-rule">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10 grid grid-cols-2 md:grid-cols-4">
          {STRIP.map((s, i) => (
            <div
              key={s.label}
              data-strip-item
              className={`flex items-center justify-center gap-3 py-6 ${i > 0 ? 'md:border-l md:border-rule' : ''}`}
            >
              <Icon name={s.icon} className="w-4.5 h-4.5 text-ink" />
              <span className="uppercase tracking-[0.22em] text-[10.5px] font-bold text-ink">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
