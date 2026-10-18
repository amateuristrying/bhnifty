import { useState, useMemo } from 'react'
import { INSTRUMENTS, BY_SYMBOL } from '../../lib/market/universe'
import { useMarket } from '../../lib/market/provider'
import { fmtPrice, fmtRupee, fmtPct } from '../../lib/format'
import Icon from '../../components/Icon'

export default function BudgetsPage() {
  const store = useMarket()

  // Account Capital Settings
  const [totalCapital, setTotalCapital] = useState(1000000) // ₹10,00,000
  const [maxRiskPct, setMaxRiskPct] = useState(1.0) // 1.0% per trade
  const [dailyLossLimit, setDailyLossLimit] = useState(25000) // ₹25,000 max daily loss

  // Position Sizing Calculator Inputs
  const [calcSym, setCalcSym] = useState('HDFCBANK')
  const [entryPrice, setEntryPrice] = useState(1680)
  const [stopLossPrice, setStopLossPrice] = useState(1660)
  const [targetPrice, setTargetPrice] = useState(1730)
  const [tradeType, setTradeType] = useState('MIS') // MIS (5x) vs CNC (1x)

  // Sync entry with quote if user selects stock
  const handleSelectCalcSym = (sym) => {
    setCalcSym(sym)
    const ltp = store.getQuote(sym)?.ltp || BY_SYMBOL[sym]?.base || 1000
    setEntryPrice(Number(ltp.toFixed(2)))
    setStopLossPrice(Number((ltp * 0.988).toFixed(2)))
    setTargetPrice(Number((ltp * 1.025).toFixed(2)))
  }

  // Position size calculations
  const sizing = useMemo(() => {
    const maxRiskRupees = totalCapital * (maxRiskPct / 100)
    const slDiff = Math.abs(entryPrice - stopLossPrice) || 1
    const targetDiff = Math.abs(targetPrice - entryPrice) || 1
    
    // Strict position sizing formula: Qty = Max Risk / (Entry - SL)
    const allowedQty = Math.max(1, Math.floor(maxRiskRupees / slDiff))
    const totalTradeValue = allowedQty * entryPrice
    const requiredMargin = tradeType === 'MIS' ? totalTradeValue / 5 : totalTradeValue
    const maxLoss = allowedQty * slDiff
    const maxProfit = allowedQty * targetDiff
    const rrRatio = (targetDiff / slDiff).toFixed(2)

    return {
      maxRiskRupees,
      slDiff,
      targetDiff,
      allowedQty,
      totalTradeValue,
      requiredMargin,
      maxLoss,
      maxProfit,
      rrRatio,
      canAfford: requiredMargin <= totalCapital,
    }
  }, [totalCapital, maxRiskPct, entryPrice, stopLossPrice, targetPrice, tradeType])

  // Sector Exposure Mock Distribution
  const allocations = [
    { name: 'Nifty Bank Constituents', pct: 45, val: totalCapital * 0.45, color: 'bg-blue-500' },
    { name: 'IT & Technology', pct: 22, val: totalCapital * 0.22, color: 'bg-purple-500' },
    { name: 'Energy & Commodities', pct: 15, val: totalCapital * 0.15, color: 'bg-amber-500' },
    { name: 'Free Cash / Liquid Margin', pct: 18, val: totalCapital * 0.18, color: 'bg-emerald-500' },
  ]

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl lg:text-3xl tracking-tight text-ink flex items-center gap-3">
            <Icon name="shield" className="w-6 h-6 text-accent" />
            Capital Allocation & Risk Cockpit
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Professional position sizing calculator and risk circuit breaker designed to safeguard your capital.
          </p>
        </div>

        {/* Risk Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rule bg-panel text-[12px] font-mono text-ink-soft">
          <span className="w-2 h-2 rounded-full bg-up" />
          <span>Risk Status: Within Safe Boundaries</span>
        </div>
      </div>

      {/* Capital Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-rule bg-panel space-y-1">
          <div className="text-ink-faint text-[11px] font-bold uppercase tracking-wider">Total Trading Equity</div>
          <div className="font-serif font-bold text-2xl lg:text-3xl text-ink">₹{fmtPrice(totalCapital)}</div>
          <div className="text-[11.5px] text-ink-soft">Configurable account balance</div>
        </div>

        <div className="p-5 rounded-xl border border-rule bg-panel space-y-1">
          <div className="text-ink-faint text-[11px] font-bold uppercase tracking-wider">Max Risk Per Trade</div>
          <div className="font-serif font-bold text-2xl lg:text-3xl text-ink">{maxRiskPct}%</div>
          <div className="text-[11.5px] text-ink-soft">Max ₹{fmtPrice(sizing.maxRiskRupees)} per trade</div>
        </div>

        <div className="p-5 rounded-xl border border-rule bg-panel space-y-1">
          <div className="text-ink-faint text-[11px] font-bold uppercase tracking-wider">Daily Loss Circuit Breaker</div>
          <div className="font-serif font-bold text-2xl lg:text-3xl text-down">₹{fmtPrice(dailyLossLimit)}</div>
          <div className="text-[11.5px] text-ink-soft">Revenge trading cutoff limit</div>
        </div>

        <div className="p-5 rounded-xl border border-rule bg-panel space-y-1">
          <div className="text-ink-faint text-[11px] font-bold uppercase tracking-wider">Available Free Margin</div>
          <div className="font-serif font-bold text-2xl lg:text-3xl text-up">₹{fmtPrice(totalCapital * 0.72)}</div>
          <div className="text-[11.5px] text-ink-soft">72% deployed across hedges</div>
        </div>
      </div>

      {/* Main Grid: Position Sizing Calculator + Sector Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Position Sizer */}
        <div className="lg:col-span-7 rounded-xl border border-rule bg-panel p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-rule">
            <h2 className="font-bold text-[16px] text-ink flex items-center gap-2">
              <Icon name="calculator" className="w-5 h-5 text-accent" />
              Institutional Position Sizing Calculator
            </h2>
            <span className="text-[11px] uppercase tracking-wider text-ink-faint font-mono">Formula: Risk ÷ SL</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Instrument Select */}
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Select Instrument</label>
              <select
                value={calcSym}
                onChange={(e) => handleSelectCalcSym(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-bold text-[14px] text-ink focus:outline-none focus:border-ink cursor-pointer"
              >
                {INSTRUMENTS.map((inst) => (
                  <option key={inst.sym} value={inst.sym}>{inst.sym} · ₹{fmtPrice(inst.base)}</option>
                ))}
              </select>
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Product Type</label>
              <div className="flex rounded-lg border border-rule bg-paper p-0.5">
                <button
                  type="button"
                  onClick={() => setTradeType('MIS')}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                    tradeType === 'MIS' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Intraday (MIS 5x)
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('CNC')}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                    tradeType === 'CNC' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Delivery (CNC 1x)
                </button>
              </div>
            </div>

            {/* Entry Price */}
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Entry Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[14.5px] text-ink focus:outline-none focus:border-ink"
              />
            </div>

            {/* Stop Loss Price */}
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Stop-Loss Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[14.5px] text-down focus:outline-none focus:border-down"
              />
            </div>

            {/* Target Price */}
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Target Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[14.5px] text-up focus:outline-none focus:border-up"
              />
            </div>
          </div>

          {/* Calculator Output Cockpit */}
          <div className="p-4 rounded-xl bg-paper border border-rule space-y-3 font-mono">
            <div className="flex justify-between items-center text-[13px] pb-2 border-b border-rule">
              <span className="font-sans text-ink-soft font-bold">Recommended Max Position Size:</span>
              <span className="font-bold text-xl text-ink">{sizing.allowedQty} Shares</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px]">
              <div>
                <span className="block text-ink-faint font-sans text-[11px]">Risk : Reward</span>
                <span className="font-bold text-ink text-[14px]">1 : {sizing.rrRatio}</span>
              </div>
              <div>
                <span className="block text-ink-faint font-sans text-[11px]">Total Risk at SL</span>
                <span className="font-bold text-down text-[14px]">−₹{fmtPrice(sizing.maxLoss)}</span>
              </div>
              <div>
                <span className="block text-ink-faint font-sans text-[11px]">Target Profit</span>
                <span className="font-bold text-up text-[14px]">+₹{fmtPrice(sizing.maxProfit)}</span>
              </div>
              <div>
                <span className="block text-ink-faint font-sans text-[11px]">Margin Required</span>
                <span className="font-bold text-ink text-[14px]">₹{fmtPrice(sizing.requiredMargin)}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-ink-faint font-sans text-[11px]">Order Value</span>
                <span className="font-bold text-ink text-[14px]">₹{fmtPrice(sizing.totalTradeValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Portfolio Allocation & Circuit Breaker */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sector Exposure Card */}
          <div className="rounded-xl border border-rule bg-panel p-6 space-y-4">
            <h3 className="font-bold text-[15px] text-ink flex items-center gap-2">
              <Icon name="pie-chart" className="w-4 h-4 text-ink-soft" />
              Capital Distribution
            </h3>

            {/* Distribution Stacked Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-paper border border-rule">
              {allocations.map((a) => (
                <div key={a.name} className={`h-full ${a.color}`} style={{ width: `${a.pct}%` }} />
              ))}
            </div>

            {/* Allocation List */}
            <div className="space-y-3 pt-2">
              {allocations.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
                    <span className="text-ink font-semibold">{a.name}</span>
                  </div>
                  <div className="font-mono text-ink-soft">
                    <span>{a.pct}%</span> · <span className="font-bold text-ink">₹{fmtPrice(a.val)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Discipline & Loss Control */}
          <div className="rounded-xl border border-rule bg-panel p-6 space-y-3">
            <h3 className="font-bold text-[14.5px] text-ink flex items-center gap-2">
              <Icon name="alert-triangle" className="w-4 h-4 text-amber-500" />
              Trader Psychology Checklist
            </h3>
            <ul className="space-y-2 text-[12.5px] text-ink-soft">
              <li className="flex items-start gap-2">
                <span className="text-up font-bold">✓</span>
                Never risk more than 1% to 2% of total capital on any single setup.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-up font-bold">✓</span>
                Exit immediately when stop-loss is reached — never average down a losing intraday position.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-up font-bold">✓</span>
                Stop trading for the day if daily circuit breaker (₹25,000) is hit.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
