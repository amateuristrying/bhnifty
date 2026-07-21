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

  /* Nav settles in — fades down from the top edge as the anchor */
  useEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      gsap.from(root.current, { y: -16, opacity: 0, duration: 0.6, ease: SETTLE })
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
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-rule bg-white overflow-hidden">
            <img src="/logo.svg" alt="BHnifty logo" className="w-8 h-8 object-contain grayscale" />
          </span>
          <span className="font-serif font-semibold text-2xl tracking-tight">BHnifty</span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {LINKS.map((l) => (
            <a
              key={l.id}
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
            to="/login"
            className="btn-lift inline-flex items-center gap-2.5 bg-ink text-paper uppercase tracking-[0.28em] text-[11px] font-bold px-6 h-11 rounded-lg"
          >
            Sign In
            <Icon name="arrow-up-right" data-arrow className="w-3.5 h-3.5" />
          </Link>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </nav>
    </header>
  )
}
