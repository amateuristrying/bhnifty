import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { INSTRUMENTS, BANKS, COMPANIES } from '../../lib/market/universe'
import { useMarket } from '../../lib/market/provider'
import { useWatchlist } from '../../lib/watchlist'
import { fmtPrice, fmtChange, fmtPct, fmtVolume } from '../../lib/format'
import Icon from '../../components/Icon'

const PRESET_STRATEGIES = [
  { id: 'all', label: 'All Instruments', icon: 'grid', desc: 'Full 50 constituent universe' },
  { id: 'day_high', label: 'Near Day High (ORB)', icon: 'arrow-up-right', desc: 'Trading within 0.5% of day high' },
  { id: 'vwap_cross', label: 'Bullish VWAP', icon: 'trending-up', desc: 'Price trading above intraday VWAP' },
  { id: 'volume_surge', label: 'Volume Surge', icon: 'zap', desc: 'Volume exceeding average session volume' },
  { id: 'rsi_oversold', label: 'RSI Reversal (<35)', icon: 'rotate-ccw', desc: 'Deep oversold pullback candidates' },
  { id: 'top_losers', label: 'Day Low Breakers', icon: 'arrow-down-right', desc: 'Trading within 0.5% of day low' },
]

const SECTORS = ['All Sectors', 'Banking', 'IT & Tech', 'Energy & Power', 'Auto & Metals', 'Consumer']

export default function MarketScannerPage() {
  const store = useMarket()
  const { has, toggle } = useWatchlist()
  
  const [strategy, setStrategy] = useState('all')
  const [sector, setSector] = useState('All Sectors')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('changePct')
  const [sortDir, setSortDir] = useState('desc')

  // Pull all live quotes from store
  const quotes = useMemo(() => {
    return INSTRUMENTS.map((inst) => {
      const q = store.getQuote(inst.sym)
      // Determine sector
      let sec = 'Other'
      if (BANKS.some(b => b.sym === inst.sym)) sec = 'Banking'
      else if (['TCS', 'INFY', 'HCLTECH', 'WIPRO'].includes(inst.sym)) sec = 'IT & Tech'
      else if (['RELIANCE', 'NTPC', 'POWERGRID', 'COALINDIA', 'ONGC'].includes(inst.sym)) sec = 'Energy & Power'
      else if (['MARUTI', 'M&M', 'TATAMOTORS', 'TATASTEEL', 'JSWSTEEL', 'HINDALCO'].includes(inst.sym)) sec = 'Auto & Metals'
      else if (['ITC', 'HINDUNILVR', 'NESTLEIND', 'TATACONSUM', 'TITAN'].includes(inst.sym)) sec = 'Consumer'

      // Calculate Technical Signal
      const distFromVwap = q ? ((q.ltp - (q.vwap || q.ltp)) / (q.vwap || q.ltp)) * 100 : 0
      const distFromHigh = q ? ((q.high - q.ltp) / q.high) * 100 : 0
      const distFromLow = q ? ((q.ltp - q.low) / q.low) * 100 : 0
      const volRatio = q ? q.volume / (q.avgVolume || 1) : 1

      let signal = 'NEUTRAL'
      let signalColor = 'text-ink-soft bg-paper'
      if (q && q.changePct > 1.2 && distFromVwap > 0.4) {
        signal = 'STRONG BUY'
        signalColor = 'text-up bg-up-soft'
      } else if (q && q.changePct > 0.2 && distFromVwap >= 0) {
        signal = 'BUY'
        signalColor = 'text-up/90 bg-up-soft/60'
      } else if (q && q.changePct < -1.2 && distFromVwap < -0.4) {
        signal = 'STRONG SELL'
        signalColor = 'text-down bg-down-soft'
      } else if (q && q.changePct < -0.2) {
        signal = 'SELL'
        signalColor = 'text-down/90 bg-down-soft/60'
      }

      return {
        ...inst,
        ...q,
        sector: sec,
        distFromVwap,
        distFromHigh,
        distFromLow,
        volRatio,
        signal,
        signalColor,
      }
    })
  }, [store])

  // Filter based on strategy, sector, search
  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      // Search
      if (search) {
        const term = search.toLowerCase()
        if (!q.sym.toLowerCase().includes(term) && !q.name.toLowerCase().includes(term)) {
          return false
        }
      }

      // Sector
      if (sector !== 'All Sectors' && q.sector !== sector) {
        return false
      }

      // Strategy
      if (strategy === 'day_high') return q.distFromHigh <= 0.6
      if (strategy === 'top_losers') return q.distFromLow <= 0.6
      if (strategy === 'vwap_cross') return q.ltp > (q.vwap || q.ltp) && q.changePct > 0
      if (strategy === 'volume_surge') return q.volRatio >= 1.2
      if (strategy === 'rsi_oversold') return q.changePct <= -1.0 // proxy for oversold

      return true
    })
  }, [quotes, strategy, sector, search])

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const valA = a[sortField] ?? 0
      const valB = b[sortField] ?? 0
      return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
    })
    return list
  }, [filtered, sortField, sortDir])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl lg:text-3xl tracking-tight text-ink flex items-center gap-3">
            <Icon name="search" className="w-6 h-6 text-accent" />
            Market Scanner
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Real-time algorithmic scanner filtering Nifty 50 constituents by volume, breakouts, and indicators.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rule bg-panel text-[12px] font-mono text-ink-soft">
          <span className="w-2 h-2 rounded-full bg-up animate-pulse" />
          <span>Screening 50 Stocks · {sorted.length} Matched</span>
        </div>
      </div>

      {/* Preset Strategy Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {PRESET_STRATEGIES.map((s) => {
          const active = strategy === s.id
          return (
            <button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                active
                  ? 'border-ink bg-panel shadow-sm ring-1 ring-ink'
                  : 'border-rule bg-panel/60 hover:bg-panel hover:border-ink-soft'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon name={s.icon} className={`w-4 h-4 ${active ? 'text-accent' : 'text-ink-soft'}`} />
                {active && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </div>
              <div className="font-bold text-[12.5px] text-ink truncate">{s.label}</div>
              <div className="text-[11px] text-ink-faint truncate mt-0.5">{s.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-rule bg-panel">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative w-64">
            <Icon name="search" className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-paper border border-rule rounded-lg pl-9 pr-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink placeholder:text-ink-faint"
            />
          </div>

          {/* Sector Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {SECTORS.map((sec) => (
              <button
                key={sec}
                onClick={() => setSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold whitespace-nowrap transition-colors ${
                  sector === sec ? 'bg-ink text-paper' : 'bg-paper text-ink-soft hover:text-ink border border-rule'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="rounded-xl border border-rule bg-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-rule bg-paper/60 text-ink-faint text-[11px] uppercase tracking-wider select-none font-semibold">
                <th className="py-3 px-4">Watch</th>
                <th className="py-3 px-4 cursor-pointer hover:text-ink" onClick={() => handleSort('sym')}>
                  Instrument
                </th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-ink" onClick={() => handleSort('ltp')}>
                  LTP (₹)
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-ink" onClick={() => handleSort('changePct')}>
                  24h Change
                </th>
                <th className="py-3 px-4 text-center min-w-[140px]">Day Range (L - H)</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-ink" onClick={() => handleSort('volume')}>
                  Volume
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-ink" onClick={() => handleSort('vwap')}>
                  VWAP
                </th>
                <th className="py-3 px-4 text-center">Algo Signal</th>
                <th className="py-3 px-4 text-right">Quick Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-mono">
              {sorted.map((s) => {
                const isGreen = s.changePct >= 0
                // Calculate percentage position within Day High / Low
                const rangeSpan = s.high - s.low || 1
                const currentPos = Math.max(0, Math.min(100, ((s.ltp - s.low) / rangeSpan) * 100))

                return (
                  <tr key={s.sym} className="hover:bg-paper/50 transition-colors">
                    {/* Star */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggle(s.sym)}
                        className={`p-1.5 rounded transition-colors ${
                          has(s.sym) ? 'text-amber-500 fill-current' : 'text-ink-faint hover:text-ink'
                        }`}
                      >
                        <Icon name="star" className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-ink">{s.sym}</div>
                      <div className="text-[11px] text-ink-faint truncate max-w-[150px]">{s.name}</div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-4 font-sans text-ink-soft text-[12px]">
                      {s.sector}
                    </td>

                    {/* LTP */}
                    <td className="py-3 px-4 text-right font-bold text-ink">
                      ₹{fmtPrice(s.ltp)}
                    </td>

                    {/* Change */}
                    <td className={`py-3 px-4 text-right font-bold ${isGreen ? 'text-up' : 'text-down'}`}>
                      {fmtChange(s.change)} ({fmtPct(s.changePct)})
                    </td>

                    {/* Day Range Slider Bar */}
                    <td className="py-3 px-4">
                      <div className="w-full">
                        <div className="flex justify-between text-[9.5px] text-ink-faint font-sans mb-1">
                          <span>₹{fmtPrice(s.low)}</span>
                          <span>₹{fmtPrice(s.high)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-paper border border-rule rounded-full relative overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isGreen ? 'bg-up' : 'bg-down'}`}
                            style={{ width: `${currentPos}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-4 text-right text-ink-soft">
                      {fmtVolume(s.volume)}
                    </td>

                    {/* VWAP */}
                    <td className="py-3 px-4 text-right text-ink-soft">
                      ₹{fmtPrice(s.vwap || s.ltp)}
                    </td>

                    {/* Technical Signal */}
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.signalColor}`}>
                        {s.signal}
                      </span>
                    </td>

                    {/* Trade Link */}
                    <td className="py-3 px-4 text-right font-sans">
                      <Link
                        to={`/app/trading?sym=${s.sym}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-paper border border-rule text-ink hover:border-ink text-[11px] font-bold transition-all"
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
    </div>
  )
}
