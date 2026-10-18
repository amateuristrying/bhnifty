import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap, SETTLE, MOTION_QUERY, motionOK } from '../lib/motion'
import { useAuth } from '../lib/auth'
import Icon from '../components/Icon'

export const NAV = [
  { to: '/app', label: 'Dashboard', icon: 'layout-dashboard', end: true },
  { to: '/app/trading', label: 'Trading View', icon: 'trending-up' },
  { to: '/app/scanner', label: 'Market Scanner', icon: 'search' },
  { to: '/app/news', label: 'Market News', icon: 'newspaper' },
  { to: '/app/watchlists', label: 'Watchlists', icon: 'star' },
  { to: '/app/budgets', label: 'Budgets', icon: 'piggy-bank' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ isDark, onToggleTheme, open, onClose }) {
  const listRef = useRef(null)
  const slabRef = useRef(null)
  const railRef = useRef(null)
  const { pathname } = useLocation()
  const { signOut } = useAuth()

  /*
   * One selection block slides between items rather than seven blocks fading
   * in and out — the eye follows a single object and the nav reads as a dial.
   * Measured after layout so the first paint is already in the right place.
   */
  useLayoutEffect(() => {
    const list = listRef.current
    const active = list?.querySelector('[data-active="true"]')
    if (!list || !active) return

    const top = active.offsetTop
    const height = active.offsetHeight
    const first = slabRef.current.dataset.placed !== 'yes'
    const to = { y: top, height, duration: first || !motionOK() ? 0 : 0.42, ease: SETTLE }

    gsap.to(slabRef.current, { ...to, autoAlpha: 1 })
    gsap.to(railRef.current, { ...to, autoAlpha: 1 })
    slabRef.current.dataset.placed = 'yes'
  }, [pathname])

  /* Nav settles in on first mount, top-down */
  useEffect(() => {
    const mm = gsap.matchMedia(listRef)
    mm.add(MOTION_QUERY, () => {
      gsap.from(listRef.current.querySelectorAll('[data-nav-item]'), {
        x: -10,
        opacity: 0,
        duration: 0.45,
        ease: SETTLE,
        stagger: 0.045,
        delay: 0.1,
      })
    })
    return () => mm.revert()
  }, [])

  /*
   * No navigate() here on purpose: clearing the session re-renders RequireAuth,
   * which redirects to /login itself and records where we were — so signing
   * back in returns you to the screen you left.
   */
  const handleSignOut = signOut

  const footItem =
    'w-full flex items-center gap-3.5 px-6 py-3 text-[13.5px] font-semibold transition-colors duration-150 cursor-pointer'

  return (
    <>
      {/* scrim — mobile only, dismisses the drawer */}
      <div
        onClick={onClose}
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[248px] lg:w-[236px] flex flex-col bg-panel border-r border-rule transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* masthead */}
        <div className="h-[100px] shrink-0 flex items-center justify-between gap-2 px-6 border-b border-rule lg:border-b-0">
          <Link to="/" className="flex items-center min-w-0" title="Back to the BHnifty site">
            <img src="/logo.png" alt="bhnifty" className="h-8 w-auto object-contain dark:invert" />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden shrink-0 w-9 h-9 -mr-2 inline-flex items-center justify-center rounded-lg text-ink-soft hover:text-ink cursor-pointer"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* sections */}
        <nav ref={listRef} className="relative flex-1 overflow-y-auto app-scroll py-5">
          <span
            ref={slabRef}
            data-slab
            className="absolute left-0 right-3 top-0 rounded-r-lg bg-paper invisible"
            aria-hidden="true"
          />
          <span
            ref={railRef}
            data-rail
            className="absolute left-0 top-0 w-[3px] rounded-r bg-ink invisible"
            aria-hidden="true"
          />

          {NAV.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                data-nav-item
                data-active={active}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 flex items-center gap-3.5 pl-6 pr-4 py-3.5 text-[13.5px] transition-colors duration-150 ${
                  active ? 'text-ink font-bold' : 'text-ink-soft font-semibold hover:text-ink'
                }`}
              >
                <Icon name={item.icon} className="w-[19px] h-[19px] shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* utilities */}
        <div className="shrink-0 border-t border-rule py-3">
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`${footItem} text-ink-soft hover:text-ink`}
          >
            <Icon name={isDark ? 'moon' : 'sun'} className="w-[19px] h-[19px] shrink-0" />
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button onClick={handleSignOut} className={`${footItem} text-down hover:opacity-80`}>
            <Icon name="log-out" className="w-[19px] h-[19px] shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
