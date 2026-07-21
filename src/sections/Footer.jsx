import { useEffect, useRef } from 'react'
import { gsap, SETTLE, MOTION_QUERY } from '../lib/motion'

const NAV = [
  { label: 'Home Overview', href: '/#hero' },
  { label: 'Features List', href: '/#features' },
  { label: 'Why BHnifty', href: '/#why-bhnifty' },
  { label: 'Frequently Asked', href: '/#faq' },
]

const SOCIALS = [
  {
    label: 'X',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'LinkedIn',
    path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
  },
  {
    label: 'GitHub',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  },
]

export default function Footer() {
  const root = useRef(null)

  /* Footer lands: columns fade up, legal row last */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      gsap.from(q('[data-col]'), {
        y: 18,
        opacity: 0,
        duration: 0.6,
        ease: SETTLE,
        stagger: 0.09,
        scrollTrigger: { trigger: root.current, start: 'top 90%', once: true },
      })
      gsap.from(q('[data-legal]'), {
        opacity: 0,
        duration: 0.6,
        ease: 'none',
        delay: 0.4,
        scrollTrigger: { trigger: root.current, start: 'top 90%', once: true },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <footer ref={root} className="border-t border-rule">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div data-col>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-rule bg-white overflow-hidden">
                <img src="/logo.svg" alt="BHnifty logo" className="w-7 h-7 object-contain grayscale" />
              </span>
              <span className="font-serif font-semibold text-2xl tracking-tight">BHnifty</span>
            </div>
            <p className="mt-4 text-[13.5px] leading-[1.7] text-ink-soft max-w-[260px]">
              The premium unified analytics console built for Nifty constituent traders and rotation
              investors.
            </p>
          </div>

          <div data-col>
            <h4 className="uppercase tracking-[0.22em] text-[11px] font-extrabold text-ink">
              Quick Navigation
            </h4>
            <ul className="mt-5 space-y-3">
              {NAV.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="link-underline text-[13.5px] font-semibold text-ink-soft hover:text-ink transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div data-col>
            <h4 className="uppercase tracking-[0.22em] text-[11px] font-extrabold text-ink">
              Contact Details
            </h4>
            <ul className="mt-5 space-y-3 text-[13.5px] font-semibold text-ink-soft">
              <li>Email: info@pacizon.in</li>
              <li>Support Desk: Active (Mon–Fri)</li>
              <li>Location: Financial District, India</li>
            </ul>
          </div>

          <div data-col>
            <h4 className="uppercase tracking-[0.22em] text-[11px] font-extrabold text-ink">
              Stay Connected
            </h4>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="btn-lift inline-flex items-center justify-center w-10 h-10 rounded-lg border border-rule bg-panel text-ink-soft hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          data-legal
          className="mt-14 pt-7 border-t border-rule flex flex-col md:flex-row items-center justify-between gap-3 text-[13px] font-medium text-ink-faint"
        >
          <span>© 2026 BHnifty Inc. Intraday index monitoring dashboards.</span>
          <span className="flex items-center gap-3">
            <a href="#" className="link-underline hover:text-ink transition-colors">Terms of Service</a>
            <span aria-hidden="true">•</span>
            <a href="#" className="link-underline hover:text-ink transition-colors">Privacy Policy</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
