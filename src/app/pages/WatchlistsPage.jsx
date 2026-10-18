import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { INSTRUMENTS, BANKS, BY_SYMBOL } from '../../lib/market/universe'
import { useMarket } from '../../lib/market/provider'
import { useWatchlist } from '../../lib/watchlist'
import { fmtPrice, fmtChange, fmtPct, fmtVolume } from '../../lib/format'
import Icon from '../../components/Icon'

export default function WatchlistsPage() {
  const store = useMarket()
  const { symbols, toggle, addMany, has } = useWatchlist()

  const [activeTab, setActiveTab] = useState('custom') // custom | banks | momentum
  const [viewMode, setViewMode] = useState('table') // table | cards
  const [searchAdd, setSearchAdd] = useState('')
  const [alertModal, setAlertModal] = useState(null) // null or symbol
  const [alertPrice, setAlertPrice] = useState('')
  const [alerts, setAlerts] = useState(() => {
    try {
      const s = localStorage.getItem('bhnifty-alerts')
      return s ? JSON.parse(s) : [
        { id: '1', sym: 'HDFCBANK', target: 1720, cond: '>=', created: 'Today' },
        { id: '2', sym: 'RELIANCE', target: 2900, cond: '<=', created: 'Today' },
      ]
    } catch {
      return []
    }
  })

  // Save alerts
  const handleSaveAlert = (e) => {
    e.preventDefault()
    if (!alertModal || !alertPrice) return
    const newAlert = {
      id: Date.now().toString(),
      sym: alertModal,
      target: Number(alertPrice),
      cond: Number(alertPrice) >= (store.getQuote(alertModal)?.ltp || 0) ? '>=' : '<=',
      created: 'Just now'
    }
    const updated = [newAlert, ...alerts]
    setAlerts(updated)
    localStorage.setItem('bhnifty-alerts', JSON.stringify(updated))
    setAlertModal(null)
    setAlertPrice('')
  }

  const handleDeleteAlert = (id) => {
    const updated = alerts.filter(a => a.id !== id)
    setAlerts(updated)
    localStorage.setItem('bhnifty-alerts', JSON.stringify(updated))
  }

  // Active list of symbols to display
  const activeSymbols = useMemo(() => {
    if (activeTab === 'banks') {
      return BANKS.map(b => b.sym)
    }
    if (activeTab === 'momentum') {
      return ['RELIANCE', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'TCS', 'INFY', 'BHARTIARTL', 'MARUTI']
    }
    // Custom: defaults to starred or top 6 if empty
    return symbols.length > 0 ? symbols : ['HDFCBANK', 'ICICIBANK', 'SBIN', 'RELIANCE', 'TCS']
  }, [activeTab, symbols])

  // Get live quotes for active symbols
  const quotes = useMemo(() => {
    return activeSymbols.map(sym => {
      const q = store.getQuote(sym) || BY_SYMBOL[sym]
      return q
    }).filter(Boolean)
  }, [activeSymbols, store])

  // Autocomplete add search candidates
  const searchResults = useMemo(() => {
    if (!searchAdd.trim()) return []
    const term = searchAdd.toLowerCase()
    return INSTRUMENTS.filter(i => 
      !activeSymbols.includes(i.sym) && 
      (i.sym.toLowerCase().includes(term) || i.name.toLowerCase().includes(term))
    ).slice(0, 5)
  }, [searchAdd, activeSymbols])

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl lg:text-3xl tracking-tight text-ink flex items-center gap-3">
            <Icon name="star" className="w-6 h-6 text-amber-500 fill-current" />
            Watchlists & Price Alerts
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Custom portfolios and automated price trigger alerts for rapid market execution.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-rule bg-panel p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-[11.5px] font-bold rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-[11.5px] font-bold rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Cards View
            </button>
          </div>
        </div>
      </div>

      {/* Watchlist Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-rule bg-panel">
        <div className="flex items-center gap-2">
          {[
            { id: 'custom', label: `My Starred (${symbols.length})` },
            { id: 'banks', label: 'BankNifty 14' },
            { id: 'momentum', label: 'Index Heavyweights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                activeTab === tab.id ? 'bg-ink text-paper' : 'bg-paper text-ink-soft hover:text-ink border border-rule'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Add Symbol */}
        <div className="relative w-full sm:w-72">
          <Icon name="plus" className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Add symbol to list..."
            value={searchAdd}
            onChange={(e) => setSearchAdd(e.target.value)}
            className="w-full bg-paper border border-rule rounded-lg pl-9 pr-3 py-1.5 text-[13px] text-ink focus:outline-none focus:border-ink placeholder:text-ink-faint"
          />

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-panel border border-rule rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-rule">
              {searchResults.map((item) => (
                <div
                  key={item.sym}
                  onClick={() => {
                    toggle(item.sym)
                    setSearchAdd('')
                  }}
                  className="px-4 py-2.5 hover:bg-paper cursor-pointer flex items-center justify-between text-[12.5px]"
                >
                  <div>
                    <span className="font-bold text-ink mr-2">{item.sym}</span>
                    <span className="text-ink-faint text-[11px]">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-accent">+ Add</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Watchlist Display */}
      {viewMode === 'table' ? (
        <div className="rounded-xl border border-rule bg-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-rule bg-paper/60 text-ink-faint text-[11px] uppercase tracking-wider select-none font-semibold">
                  <th className="py-3 px-4">Starred</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4 text-right">LTP (₹)</th>
                  <th className="py-3 px-4 text-right">Change</th>
                  <th className="py-3 px-4 text-center min-w-[150px]">Day Range</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-center">Alert</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule font-mono">
                {quotes.map((s) => {
                  const isGreen = (s.changePct || 0) >= 0
                  const rangeSpan = s.high - s.low || 1
                  const currentPos = Math.max(0, Math.min(100, ((s.ltp - s.low) / rangeSpan) * 100))

                  return (
                    <tr key={s.sym} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggle(s.sym)}
                          className={`p-1.5 rounded transition-colors ${
                            has(s.sym) ? 'text-amber-500 fill-current' : 'text-ink-faint hover:text-ink'
                          }`}
                        >
                          <Icon name="star" className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-ink">{s.sym}</div>
                        <div className="text-[11px] text-ink-faint">{s.name}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-ink">
                        ₹{fmtPrice(s.ltp)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${isGreen ? 'text-up' : 'text-down'}`}>
                        {fmtChange(s.change)} ({fmtPct(s.changePct)})
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full">
                          <div className="flex justify-between text-[9.5px] text-ink-faint font-sans mb-1">
                            <span>₹{fmtPrice(s.low)}</span>
                            <span>₹{fmtPrice(s.high)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-paper border border-rule rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isGreen ? 'bg-up' : 'bg-down'}`}
                              style={{ width: `${currentPos}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-ink-soft">
                        {fmtVolume(s.volume)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => {
                            setAlertModal(s.sym)
                            setAlertPrice(s.ltp.toFixed(2))
                          }}
                          className="px-2.5 py-1 rounded bg-paper hover:bg-ink hover:text-paper border border-rule text-[11px] font-bold transition-all"
                        >
                          + Set Alert
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <Link
                          to={`/app/trading?sym=${s.sym}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-ink text-paper text-[11px] font-bold hover:opacity-90 transition-all"
                        >
                          Trade
                          <Icon name="arrow-up-right" className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quotes.map((s) => {
            const isGreen = (s.changePct || 0) >= 0
            return (
              <div key={s.sym} className="p-5 rounded-xl border border-rule bg-panel space-y-3 hover:border-ink transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-[16px] text-ink">{s.sym}</span>
                    <span className="block text-[11.5px] text-ink-faint truncate max-w-[160px]">{s.name}</span>
                  </div>
                  <button
                    onClick={() => toggle(s.sym)}
                    className={has(s.sym) ? 'text-amber-500 fill-current' : 'text-ink-faint hover:text-ink'}
                  >
                    <Icon name="star" className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-serif font-bold text-2xl text-ink">₹{fmtPrice(s.ltp)}</span>
                  <span className={`text-[13px] font-bold ${isGreen ? 'text-up' : 'text-down'}`}>
                    {fmtPct(s.changePct)}
                  </span>
                </div>

                <div className="pt-2 border-t border-rule flex items-center justify-between text-[11.5px]">
                  <span className="text-ink-faint">Vol: {fmtVolume(s.volume)}</span>
                  <Link
                    to={`/app/trading?sym=${s.sym}`}
                    className="font-bold text-ink hover:text-accent flex items-center gap-1"
                  >
                    Trade Chart &rarr;
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Active Price Alerts Drawer / Section */}
      <div className="rounded-xl border border-rule bg-panel p-5">
        <h2 className="font-bold text-[15px] text-ink flex items-center gap-2 mb-4">
          <Icon name="bell" className="w-4 h-4 text-accent" />
          Active Price Triggers & Alerts ({alerts.length})
        </h2>

        {alerts.length === 0 ? (
          <p className="text-[13px] text-ink-faint py-3">No active alerts set. Click "+ Set Alert" on any stock above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((a) => (
              <div key={a.id} className="p-3.5 rounded-lg border border-rule bg-paper flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink text-[13.5px]">{a.sym}</span>
                  <span className="text-ink-soft text-[12px] ml-2">Trigger {a.cond} ₹{fmtPrice(a.target)}</span>
                  <div className="text-[10px] text-ink-faint mt-0.5">Created {a.created} · Push Enabled</div>
                </div>
                <button
                  onClick={() => handleDeleteAlert(a.id)}
                  className="p-1 text-ink-faint hover:text-down transition-colors"
                  title="Remove alert"
                >
                  <Icon name="x" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Set Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-panel border border-rule rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-[scaleUp_0.2s]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-ink">Set Price Alert for {alertModal}</h3>
              <button onClick={() => setAlertModal(null)} className="text-ink-faint hover:text-ink">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlert} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Target Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[15px] text-ink focus:outline-none focus:border-ink"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className="flex-1 py-2 rounded-lg border border-rule text-ink-soft text-[12.5px] font-bold hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-ink text-paper text-[12.5px] font-bold hover:opacity-90"
                >
                  Save Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
