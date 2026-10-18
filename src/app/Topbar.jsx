import { useEffect, useRef, useState } from 'react'
import { gsap, SETTLE, motionOK } from '../lib/motion'
import { useAuth } from '../lib/auth'
import Icon from '../components/Icon'

function AccountMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const panelRef = useRef(null)

  /* click-away and Escape both close it */
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /* drops from under the avatar rather than appearing */
  useEffect(() => {
    if (!open || !panelRef.current || !motionOK()) return
    const tl = gsap.timeline()
    tl.fromTo(
      panelRef.current,
      { y: -8, opacity: 0, scaleY: 0.96, transformOrigin: 'top right' },
      { y: 0, opacity: 1, scaleY: 1, duration: 0.24, ease: SETTLE },
    ).fromTo(
      panelRef.current.querySelectorAll('[data-menu-item]'),
      { opacity: 0, y: -4 },
      { opacity: 1, y: 0, duration: 0.2, stagger: 0.04, ease: SETTLE },
      '-=0.12',
    )
    return () => tl.revert()
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-lg hover:bg-paper transition-colors duration-150 cursor-pointer"
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-ink text-paper inline-flex items-center justify-center font-bold text-[15px]">
          {user.name.charAt(0)}
        </span>
        <span className="hidden md:block text-left leading-tight max-w-[170px]">
          <span className="block text-[13.5px] font-bold text-ink truncate">{user.name}</span>
          <span className="block text-[11.5px] text-ink-faint truncate">{user.email}</span>
        </span>
        <Icon
          name="chevron-down"
          className={`hidden md:block w-4 h-4 text-ink-faint transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] w-60 rounded-xl border border-rule bg-panel shadow-xl overflow-hidden z-50"
        >
          <div data-menu-item className="px-4 py-3.5 border-b border-rule">
            <div className="text-[13.5px] font-bold text-ink truncate">{user.name}</div>
            <div className="text-[11.5px] text-ink-faint truncate">{user.email}</div>
          </div>
          <button
            data-menu-item
            role="menuitem"
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-[13.5px] font-semibold text-down hover:bg-paper transition-colors cursor-pointer"
          >
            <Icon name="log-out" className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Topbar({ isDark, onToggleTheme, onOpenNav }) {
  const { user, signOut } = useAuth()
  /* RequireAuth owns the redirect once the session clears — see Sidebar */

  const iconBtn =
    'inline-flex items-center justify-center w-10 h-10 rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition-colors duration-150 cursor-pointer'

  return (
    <header className="sticky top-0 z-30 h-[100px] shrink-0 bg-paper/90 backdrop-blur-md border-b border-rule">
      <div className="h-full px-5 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onOpenNav} aria-label="Open navigation" className={`lg:hidden ${iconBtn}`}>
            <Icon name="menu" className="w-5 h-5" />
          </button>
          <p className="text-[14.5px] text-ink-soft truncate">
            Welcome back, <span className="font-bold text-accent">{user.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={iconBtn}
          >
            <Icon name={isDark ? 'sun' : 'moon'} className="w-[18px] h-[18px]" />
          </button>

          <button aria-label="Notifications" className={`relative ${iconBtn}`}>
            <Icon name="bell" className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2.5 w-[6px] h-[6px] rounded-full bg-accent" />
          </button>

          <AccountMenu user={user} onSignOut={signOut} />
        </div>
      </div>
    </header>
  )
}
