import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { motionOK } from '../../lib/motion'

/*
 * What the analysis console is looking at.
 *
 * Heat-map tiles and mover rows are the selectors; the console is the reader.
 * Selection also owns the alert list, so alerts survive switching instruments
 * and back again.
 */

const SelectionContext = createContext(null)

const DEFAULT_SYMBOL = 'RELIANCE'

export function SelectionProvider({ children }) {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL)
  const [alerts, setAlerts] = useState([])
  /* mirrors `symbol` so the trail is pushed outside the state updater, which
     StrictMode is free to invoke twice */
  const current = useRef(DEFAULT_SYMBOL)
  const history = useRef([])
  const consoleRef = useRef(null)

  const go = useCallback((next) => {
    current.current = next
    setSymbol(next)
  }, [])

  /* selecting scrolls the console into view — the section is below the fold */
  const select = useCallback(
    (next, { reveal = true } = {}) => {
      if (next !== current.current) {
        history.current.push(current.current)
        go(next)
      }
      if (reveal && consoleRef.current) {
        consoleRef.current.scrollIntoView({
          behavior: motionOK() ? 'smooth' : 'auto',
          block: 'start',
        })
      }
    },
    [go],
  )

  const back = useCallback(() => {
    const previous = history.current.pop()
    if (previous) go(previous)
  }, [go])

  const canGoBack = history.current.length > 0

  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [{ ...alert, id: `${Date.now()}-${prev.length}` }, ...prev])
  }, [])

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const value = useMemo(
    () => ({ symbol, select, back, canGoBack, consoleRef, alerts, addAlert, removeAlert }),
    [symbol, select, back, canGoBack, alerts, addAlert, removeAlert],
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection must be used inside <SelectionProvider>')
  return ctx
}
