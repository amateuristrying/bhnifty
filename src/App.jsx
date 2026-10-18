import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './lib/auth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AppShell from './app/AppShell'
import Dashboard from './app/dashboard/Dashboard'
import TradingViewPage from './app/pages/TradingViewPage'
import MarketScannerPage from './app/pages/MarketScannerPage'
import MarketNewsPage from './app/pages/MarketNewsPage'
import WatchlistsPage from './app/pages/WatchlistsPage'
import BudgetsPage from './app/pages/BudgetsPage'
import SettingsPage from './app/pages/SettingsPage'

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
          <Route path="trading" element={<TradingViewPage />} />
          <Route path="scanner" element={<MarketScannerPage />} />
          <Route path="news" element={<MarketNewsPage />} />
          <Route path="watchlists" element={<WatchlistsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
