import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'

export default function App() {
  /* Authored in light and dark from the start — light is the default */
  const [isDark, setIsDark] = useState(() => localStorage.getItem('bhnifty-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('bhnifty-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggle = () => setIsDark((v) => !v)

  return (
    <Routes>
      <Route path="/" element={<Landing isDark={isDark} onToggleTheme={toggle} />} />
      <Route path="/login" element={<Login isDark={isDark} onToggleTheme={toggle} />} />
    </Routes>
  )
}
