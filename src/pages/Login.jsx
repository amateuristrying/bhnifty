import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, SETTLE, MOTION_QUERY } from '../lib/motion'
import useSmoothScroll from '../lib/useSmoothScroll'
import Icon from '../components/Icon'
import ThemeToggle from '../components/ThemeToggle'
import Placeholder from '../components/Placeholder'
import Footer from '../sections/Footer'

function GoogleG({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.46-.22-2.1H12v3.98h6.6c-.13 1.06-.85 2.66-2.44 3.73l-.02.15 3.54 2.66.25.02c2.25-2.02 3.56-5 3.56-8.44" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.03 7.94-2.82l-3.78-2.83c-1.01.68-2.37 1.16-4.16 1.16-3.17 0-5.86-2.03-6.82-4.83l-.14.01-3.68 2.75-.05.13C3.28 21.3 7.31 24 12 24" />
      <path fill="#FBBC05" d="M5.18 14.68A7.2 7.2 0 0 1 4.77 12c0-.93.16-1.83.4-2.68l-.01-.18-3.73-2.8-.12.06A11.94 11.94 0 0 0 0 12c0 1.93.47 3.76 1.31 5.38l3.87-2.9" />
      <path fill="#EB4335" d="M12 4.63c2.25 0 3.77.94 4.63 1.73l3.38-3.19C17.95 1.19 15.24 0 12 0 7.31 0 3.28 2.7 1.31 6.62l3.86 2.9c.97-2.8 3.66-4.89 6.83-4.89" />
    </svg>
  )
}

export default function Login({ isDark, onToggleTheme }) {
  const root = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [working, setWorking] = useState(false)

  /* same inertial feel as the landing page; no section snapping here */
  useSmoothScroll()

  /* Illustration wipes in on the left; label + serif heading + fields rise on the right */
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_QUERY, () => {
      const tl = gsap.timeline({ delay: 0.1 })
      tl.from(q('[data-illustration]'), {
        clipPath: 'inset(0% 100% 0% 0%)',
        opacity: 0,
        duration: 0.8,
        ease: SETTLE,
      }).from(
        q('[data-field]'),
        { y: 16, opacity: 0, duration: 0.5, ease: SETTLE, stagger: 0.07 },
        '-=0.45',
      )
    })
    return () => mm.revert()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    setWorking(true)
    /* real auth flow arrives with the dashboard stage */
    setTimeout(() => setWorking(false), 1200)
  }

  const inputCls =
    'w-full rounded-lg border border-rule bg-panel px-4 py-3.5 text-[14.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors duration-150'

  return (
    <div ref={root} className="min-h-screen bg-paper text-ink font-sans transition-colors duration-300 flex flex-col">
      {/* slim auth nav */}
      <header className="border-b border-rule">
        <nav className="mx-auto max-w-[1320px] px-6 md:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-rule bg-white overflow-hidden">
              <img src="/logo.svg" alt="BHnifty logo" className="w-8 h-8 object-contain grayscale" />
            </span>
            <span className="font-serif font-semibold text-2xl tracking-tight">BHnifty</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="btn-lift bg-ink text-paper text-[13px] font-bold px-6 h-11 rounded-lg cursor-pointer">
              Sign up
            </button>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </nav>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1320px] px-6 md:px-10 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* noir handshake illustration — final asset to be supplied */}
        <div data-illustration className="hidden lg:block">
          <Placeholder label="HANDSHAKE" ratio="4 / 3" className="border-none bg-transparent" />
        </div>

        <div className="w-full max-w-[520px] lg:justify-self-end">
          <Link
            data-field
            to="/"
            className="inline-flex items-center gap-3 uppercase tracking-[0.3em] text-[11px] font-bold text-ink-soft hover:text-ink transition-colors"
          >
            <Icon name="arrow-left" className="w-4 h-4" />
            Welcome Back
          </Link>

          <h1 data-field className="mt-5 font-serif font-semibold text-4xl md:text-5xl tracking-tight">
            Sign in to BHnifty
          </h1>
          <p data-field className="mt-4 text-ink-soft leading-[1.6]">
            Access your dashboard and stay ahead
            <br className="hidden md:block" /> with real-time market intelligence.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <div data-field>
              <label htmlFor="email" className="block text-[13px] font-bold text-ink mb-2">
                Email
              </label>
              <input id="email" type="email" required placeholder="you@example.com" className={inputCls} />
            </div>

            <div data-field>
              <label htmlFor="password" className="block text-[13px] font-bold text-ink mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink-faint hover:text-ink transition-colors cursor-pointer"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div data-field className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-[13.5px] font-semibold text-ink-soft cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#101010] dark:accent-[#f4f3f0]" />
                Remember me
              </label>
              <a href="#" className="link-underline text-[13px] font-bold text-ink">
                Forgot password?
              </a>
            </div>

            <button
              data-field
              type="submit"
              disabled={working}
              className="btn-lift w-full inline-flex items-center justify-center gap-3 bg-ink text-paper uppercase tracking-[0.28em] text-[11px] font-bold h-13 rounded-lg disabled:opacity-60 disabled:pointer-events-none"
            >
              {working ? 'Signing in…' : 'Sign In'}
              <Icon name="arrow-up-right" data-arrow className="w-3.5 h-3.5" />
            </button>

            <div data-field className="flex items-center gap-4">
              <span className="flex-1 h-px bg-rule" />
              <span className="uppercase tracking-[0.24em] text-[10.5px] font-bold text-ink-faint">or</span>
              <span className="flex-1 h-px bg-rule" />
            </div>

            <button
              data-field
              type="button"
              className="btn-lift w-full inline-flex items-center justify-center gap-3 border border-rule bg-panel text-ink uppercase tracking-[0.24em] text-[11px] font-bold h-13 rounded-lg hover:border-ink cursor-pointer"
            >
              <GoogleG className="w-4.5 h-4.5" />
              Continue with Google
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
