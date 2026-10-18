import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './lib/auth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AppShell from './app/AppShell'
import Dashboard from './app/dashboard/Dashboard'
import Soon from './app/pages/Soon'

/* The sections behind the rail that arrive once the broker feed is live */
const RESERVED = [
  {
    path: 'trading',
    title: 'Trading View',
    icon: 'trending-up',
    blurb:
      'Full-screen candles, drawing tools and depth for any Nifty constituent — wired to the same feed powering the dashboard.',
  },
  {
    path: 'scanner',
    title: 'Market Scanner',
    icon: 'search',
    blurb:
      'Filter the whole board by move, volume, weight and sector, and save the screens you run every morning.',
  },
  {
    path: 'news',
    title: 'Market News',
    icon: 'newspaper',
    blurb: 'Exchange filings and headlines, threaded against the tickers they actually move.',
  },
  {
    path: 'watchlists',
    title: 'Watchlists',
    icon: 'star',
    blurb: 'Your own lists, ticking live, with alerts on the levels you care about.',
  },
  {
    path: 'budgets',
    title: 'Budgets',
    icon: 'piggy-bank',
    blurb: 'Position sizing and capital allocation, measured against what the market is doing today.',
  },
  {
    path: 'settings',
    title: 'Settings',
    icon: 'settings',
    blurb: 'Broker connection, market-hours preferences and how loudly the console talks to you.',
  },
]

export default function App() {
  /* Authored in light and dark from the start — light is the default */
  const [isDark, setIsDark] = useState(() => localStorage.getItem('bhnifty-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('bhnifty-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggle = () => setIsDark((v) => !v)

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing isDark={isDark} onToggleTheme={toggle} />} />
        <Route path="/login" element={<Login isDark={isDark} onToggleTheme={toggle} />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell isDark={isDark} onToggleTheme={toggle} />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          {RESERVED.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={<Soon title={r.title} icon={r.icon} blurb={r.blurb} />}
            />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
