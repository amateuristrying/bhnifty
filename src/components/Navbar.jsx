import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, SETTLE, MOTION_QUERY } from '../lib/motion'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { label: 'Home', href: '/#hero', id: 'hero' },
  { label: 'Features', href: '/#features', id: 'features' },
  { label: 'Why BHnifty', href: '/#why-bhnifty', id: 'why-bhnifty' },
  { label: 'About', href: '/#about', id: 'about' },
  { label: 'FAQ', href: '/#faq', id: 'faq' },
]

export default function Navbar({ isDark, onToggleTheme }) {
  const root = useRef(null)
  const [active, setActive] = useState('hero')

  /* Orchestrated Nav Entrance: header fade → logo slide-in → nav links cascade → CTA button & theme toggle */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const tl = gsap.timeline({ delay: 0.05 })
      tl.from(root.current, { y: -16, opacity: 0, duration: 0.55, ease: SETTLE })
        .from(
          q('[data-nav-logo]'),
          { x: -24, opacity: 0, scale: 0.94, duration: 0.65, ease: SETTLE },
          '-=0.35',
        )
        .from(
          q('[data-nav-link]'),
          { y: -12, opacity: 0, duration: 0.5, ease: SETTLE, stagger: 0.07 },
          '-=0.45',
        )
        .from(
          q('[data-nav-cta]'),
          { x: 20, opacity: 0, scale: 0.94, duration: 0.6, ease: SETTLE },
          '-=0.4',
        )
        .from(
          q('[data-nav-theme]'),
          { scale: 0.75, opacity: 0, rotate: -15, duration: 0.5, ease: 'back.out(1.8)' },
          '-=0.35',
        )
    })
    return () => mm.revert()
  }, [])

  /* Active-section dot */
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean)
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header
      ref={root}
      className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-rule transition-colors duration-300"
    >
      <nav className="mx-auto max-w-[1320px] px-6 md:px-10 h-20 flex items-center justify-between gap-6">
        <Link data-nav-logo to="/" className="flex items-center shrink-0 group py-1" aria-label="BHnifty Home">
          <img
            src="/logo.png"
            alt="bhnifty"
            className="h-8 md:h-9 w-auto object-contain dark:invert transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {LINKS.map((l) => (
            <a
              key={l.id}
              data-nav-link
              href={l.href}
              className="relative uppercase tracking-[0.3em] text-[11px] font-bold text-ink hover:text-ink transition-colors"
            >
              {l.label}
              <span
                className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 w-1 h-1 rounded-full bg-ink transition-opacity duration-300 ${
                  active === l.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            data-nav-cta
            to="/login"
            className="btn-lift inline-flex items-center gap-2.5 bg-ink text-paper uppercase tracking-[0.28em] text-[11px] font-bold px-6 h-11 rounded-lg"
          >
            Sign In
            <Icon name="arrow-up-right" data-arrow className="w-3.5 h-3.5" />
          </Link>
          <div data-nav-theme>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>
      </nav>
    </header>
  )
}
