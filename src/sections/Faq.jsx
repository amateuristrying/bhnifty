import { useEffect, useRef, useState } from 'react'
import { gsap, SETTLE, REVEAL_START, MOTION_QUERY, revealHeadline, revealParagraph } from '../lib/motion'
import Icon from '../components/Icon'

const FAQS = [
  { q: 'What is BHnifty exactly?', a: 'BHnifty is a professional-grade fintech tracking dashboard designed specifically for active traders, analysts, and investors looking to monitor Nifty sector tickers (such as BankNifty constituents) from a unified, clutter-free console.' },
  { q: 'How does the Live Market Overview work?', a: 'The live market system queries real-time ticks for registered Nifty, calculating category indicators, high/low distributions, and overall cashflow indexes so you can spot capital flows instantly.' },
  { q: 'Can I set custom spending alerts and budgets?', a: 'Yes! While BHnifty is optimized as a market constituent monitor, it also includes personal ledger entries and category-specific budget limits to track and limit your capital draws and operating costs.' },
  { q: 'Is there a fee to use BHnifty?', a: 'Currently, the core analytical dashboard, transactions ledger, and budget configurations are free to use. Premium automated alerts and integrations are coming soon.' },
  { q: 'Is my data secure?', a: 'Absolutely. BHnifty uses JWT session signatures stored locally in your browser. All database storage is bound to your account and hashed using industry-standard bcrypt cryptographies.' },
]

export default function Faq() {
  const root = useRef(null)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      revealHeadline(q('[data-head] h2'), { y: 38, rotateX: 14 })
      revealParagraph(q('[data-head] p'), { y: 20 })
      gsap.from(q('[data-head] span'), {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: SETTLE,
        scrollTrigger: { trigger: root.current, start: REVEAL_START, once: true },
      })
      gsap.from(q('[data-item]'), {
        y: 20,
        opacity: 0,
        filter: 'blur(3px)',
        duration: 0.55,
        ease: SETTLE,
        stagger: 0.08,
        scrollTrigger: { trigger: q('[data-list]')[0], start: 'top 85%', once: true },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="faq" ref={root} className="border-b border-rule">
      <div className="mx-auto max-w-[880px] px-6 md:px-10 py-24 md:py-32">
        <div data-head className="text-center">
          <span className="inline-block uppercase tracking-[0.3em] text-[10.5px] font-bold text-ink-soft border border-rule rounded-full px-4 py-2">
            FAQ
          </span>
          <h2 className="mt-6 font-serif font-semibold text-4xl md:text-6xl tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-5 text-ink-soft leading-[1.6]">
            Common inquiries regarding our analytical utilities
          </p>
        </div>

        {/* no boxes — just baselines */}
        <div data-list className="mt-14 border-t border-rule">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} data-item className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left cursor-pointer group"
                >
                  <span className="font-serif font-semibold text-xl md:text-2xl text-ink">{f.q}</span>
                  <Icon
                    name="plus"
                    className={`w-5 h-5 shrink-0 text-ink-soft transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                    style={{ transitionTimingFunction: 'var(--ease-settle)' }}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300"
                  style={{
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transitionTimingFunction: 'var(--ease-settle)',
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-7 text-ink-soft leading-[1.7] max-w-2xl">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
