import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MarketProvider } from '../lib/market/provider'
import { WatchlistProvider } from '../lib/watchlist'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AppFooter from './AppFooter'

/*
 * The authenticated console. Fixed rail, sticky header, native scrolling in
 * the content column — a tool, not a scroll narrative, so no Lenis here.
 */
export default function AppShell({ isDark, onToggleTheme }) {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  /* the drawer never survives a route change or a jump to desktop width */
  useEffect(() => setNavOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <MarketProvider>
      <WatchlistProvider>
        <div className="min-h-screen bg-paper text-ink font-sans transition-colors duration-300">
          <Sidebar
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            open={navOpen}
            onClose={() => setNavOpen(false)}
          />

          <div className="lg:pl-[236px] flex flex-col min-h-screen">
            <Topbar
              isDark={isDark}
              onToggleTheme={onToggleTheme}
              onOpenNav={() => setNavOpen(true)}
            />
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
            <AppFooter />
          </div>
        </div>
      </WatchlistProvider>
    </MarketProvider>
  )
}
