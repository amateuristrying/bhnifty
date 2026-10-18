import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/*
 * Placeholder session. No network, no password check — signing in with any
 * credentials opens the console. Everything the app consumes goes through
 * `useAuth()`, so replacing this with a real broker login (Angel One's TOTP
 * flow) touches this file and nothing else.
 */

const KEY = 'bhnifty-session'
const AuthContext = createContext(null)

/* "chauhanbaha1977@outlook.com" → "Chauhanbaha" */
function displayName(email) {
  const local = String(email || '').split('@')[0]
  const first = local.split(/[._\-+0-9]+/).filter(Boolean)[0] || 'Trader'
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(read)

  const signIn = useCallback((email) => {
    const session = {
      email: email || 'trader@bhnifty.in',
      name: displayName(email),
      since: Date.now(),
    }
    localStorage.setItem(KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/* Route guard — bounces to sign-in and remembers where you were headed */
export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
