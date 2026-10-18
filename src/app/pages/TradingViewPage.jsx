import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { INSTRUMENTS, BY_SYMBOL } from '../../lib/market/universe'
import { useQuote, useStockCandles } from '../../lib/market/provider'
import { useWatchlist } from '../../lib/watchlist'
import { fmtPrice, fmtChange, fmtPct, fmtVolume, fmtRupee } from '../../lib/format'
import Icon from '../../components/Icon'

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '1D']

export default function TradingViewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSym = searchParams.get('sym') || 'HDFCBANK'
  const [selectedSym, setSelectedSym] = useState(initialSym)
  const [timeframe, setTimeframe] = useState('5m')
  const [chartType, setChartType] = useState('candles') // candles | line
  const [indicators, setIndicators] = useState({ vwap: true, ema: true, rsi: true, volume: true })
  
  // Order ticket state
  const [orderSide, setOrderSide] = useState('buy') // buy | sell
  const [orderType, setOrderType] = useState('market') // market | limit | sl
  const [productType, setProductType] = useState('mis') // mis | cnc
  const [qty, setQty] = useState(50)
  const [limitPrice, setLimitPrice] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(null)
  
  // Open positions log
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('bhnifty-positions')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Watchlist hook
  const { has, toggle } = useWatchlist()

  // Live quote for selected instrument
  const quote = useQuote(selectedSym) || BY_SYMBOL[selectedSym] || INSTRUMENTS[0]
  
  // Historical candles
  const rawCandles = useStockCandles(selectedSym, 32)

  // Sync limit price with quote ltp on first switch
  useEffect(() => {
    if (quote?.ltp) {
      setLimitPrice(quote.ltp.toFixed(2))
    }
  }, [selectedSym])

  // Save positions
  useEffect(() => {
    localStorage.setItem('bhnifty-positions', JSON.stringify(positions))
  }, [positions])

  // Select stock
  const handleSelectSym = (sym) => {
    setSelectedSym(sym)
    setSearchParams({ sym })
  }

  // Calculate moving averages & indicators on the fly
  const { candlesWithIndicators, rsiData, vwapLine } = useMemo(() => {
    if (!rawCandles || !rawCandles.length) return { candlesWithIndicators: [], rsiData: [], vwapLine: [] }
    
    // EMA 9 & 21
    const ema9 = []
    const ema21 = []
    const k9 = 2 / (9 + 1)
    const k21 = 2 / (21 + 1)
    let prevEma9 = rawCandles[0].c
    let prevEma21 = rawCandles[0].c

    // RSI calculation
    const rsi = []
    let gains = 0
    let losses = 0

    const list = rawCandles.map((c, i) => {
      // EMA
      prevEma9 = i === 0 ? c.c : c.c * k9 + prevEma9 * (1 - k9)
      prevEma21 = i === 0 ? c.c : c.c * k21 + prevEma21 * (1 - k21)
      ema9.push(prevEma9)
      ema21.push(prevEma21)

      // RSI (14)
      if (i > 0) {
        const diff = c.c - rawCandles[i - 1].c
        if (diff >= 0) gains += diff
        else losses += Math.abs(diff)
      }
      const avgGain = (gains / Math.max(1, i))
      const avgLoss = (losses / Math.max(1, i))
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      const rsiVal = 100 - (100 / (1 + rs))
      rsi.push(Math.min(95, Math.max(5, rsiVal)))

      // Simulated volume bars
      const vol = Math.round(15000 + ((c.h - c.l) / (c.c || 1)) * 900000)

      return {
        ...c,
        ema9: prevEma9,
        ema21: prevEma21,
        volume: vol,
        isUp: c.c >= c.o
      }
    })

    const vwap = quote?.vwap || quote?.ltp

    return { candlesWithIndicators: list, rsiData: rsi, vwapLine: vwap }
  }, [rawCandles, quote?.vwap, quote?.ltp])

  // Simulated Level 2 Market Depth (5 Best Bids & Asks)
  const depth = useMemo(() => {
    const ltp = quote?.ltp || 1000
    const bids = []
    const asks = []
    let totalBidQty = 0
    let totalAskQty = 0

    for (let i = 0; i < 5; i++) {
      const bidPrice = ltp - (i + 1) * 0.35
      const bidQty = Math.round(450 * (5 - i) + (i * 120))
      const bidOrders = 12 - i * 2
      totalBidQty += bidQty
      bids.push({ price: bidPrice, qty: bidQty, orders: bidOrders })

      const askPrice = ltp + (i + 1) * 0.35
      const askQty = Math.round(420 * (5 - i) + (i * 140))
      const askOrders = 11 - i * 2
      totalAskQty += askQty
      asks.push({ price: askPrice, qty: askQty, orders: askOrders })
    }

    const buyRatio = Math.round((totalBidQty / (totalBidQty + totalAskQty)) * 100)
    return { bids, asks, totalBidQty, totalAskQty, buyRatio }
  }, [quote?.ltp, quote?.seq])

  // Handle Order Placement
  const handlePlaceOrder = (e) => {
    e.preventDefault()
    const execPrice = orderType === 'market' ? quote.ltp : Number(limitPrice) || quote.ltp
    const requiredMargin = (execPrice * qty) / (productType === 'mis' ? 5 : 1)
    
    const newPos = {
      id: Date.now().toString(),
      sym: selectedSym,
      side: orderSide,
      type: orderType,
      product: productType,
      qty,
      entryPrice: execPrice,
      ltp: quote.ltp,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }

    setPositions([newPos, ...positions])
    setOrderSuccess(`Executed: ${orderSide.toUpperCase()} ${qty} ${selectedSym} @ ₹${fmtPrice(execPrice)}`)
    setTimeout(() => setOrderSuccess(null), 4000)
  }

  // Close a position
  const handleClosePosition = (id) => {
    setPositions(positions.filter((p) => p.id !== id))
  }

  // Chart Dimensions & Scales
  const chartHeight = 360
  const rsiHeight = 85
  const minPrice = useMemo(() => Math.min(...candlesWithIndicators.map(c => c.l)) * 0.998, [candlesWithIndicators])
  const maxPrice = useMemo(() => Math.max(...candlesWithIndicators.map(c => c.h)) * 1.002, [candlesWithIndicators])
  const priceRange = maxPrice - minPrice || 1

  const getY = (val) => chartHeight - ((val - minPrice) / priceRange) * chartHeight
  const getRsiY = (val) => rsiHeight - (val / 100) * rsiHeight

  // Active crosshair hover
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const activeCandle = hoveredIndex !== null ? candlesWithIndicators[hoveredIndex] : candlesWithIndicators[candlesWithIndicators.length - 1]

  const isUp = (quote?.changePct || 0) >= 0

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-rule bg-panel">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Symbol Selector */}
          <div className="relative">
            <select
              value={selectedSym}
              onChange={(e) => handleSelectSym(e.target.value)}
              className="appearance-none bg-paper border border-rule rounded-lg px-4 py-2 pr-9 font-bold text-[15px] text-ink focus:outline-none focus:border-ink cursor-pointer"
            >
              <optgroup label="Nifty Bank">
                {INSTRUMENTS.filter(i => i.weight > 2.5).map(i => (
                  <option key={i.sym} value={i.sym}>{i.sym} · {i.name}</option>
                ))}
              </optgroup>
              <optgroup label="Nifty 50 Heavyweights">
                {INSTRUMENTS.filter(i => i.weight <= 2.5).map(i => (
                  <option key={i.sym} value={i.sym}>{i.sym} · {i.name}</option>
                ))}
              </optgroup>
            </select>
            <Icon name="chevron-down" className="w-4 h-4 text-ink-soft absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Star watchlist */}
          <button
            onClick={() => toggle(selectedSym)}
            className={`p-2 rounded-lg border border-rule transition-colors ${has(selectedSym) ? 'bg-amber-400/15 text-amber-500 border-amber-500/40' : 'bg-paper text-ink-soft hover:text-ink'}`}
            title={has(selectedSym) ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Icon name="star" className="w-4 h-4 fill-current" />
          </button>

          {/* Live Price Tag */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl lg:text-3xl tabular-nums text-ink">
              ₹{fmtPrice(quote.ltp)}
            </span>
            <span className={`inline-flex items-center text-[13px] font-bold tabular-nums ${isUp ? 'text-up' : 'text-down'}`}>
              <Icon name={isUp ? 'arrow-up-right' : 'arrow-down-right'} className="w-3.5 h-3.5 mr-0.5" />
              {fmtChange(quote.change)} ({fmtPct(quote.changePct)})
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="hidden xl:flex items-center gap-5 border-l border-rule pl-5 text-[12.5px] text-ink-soft">
            <div>Open: <span className="font-semibold text-ink">₹{fmtPrice(quote.open)}</span></div>
            <div>High: <span className="font-semibold text-up">₹{fmtPrice(quote.high)}</span></div>
            <div>Low: <span className="font-semibold text-down">₹{fmtPrice(quote.low)}</span></div>
            <div>VWAP: <span className="font-semibold text-ink">₹{fmtPrice(quote.vwap || quote.ltp)}</span></div>
            <div>Vol: <span className="font-semibold text-ink">{fmtVolume(quote.volume)}</span></div>
          </div>
        </div>

        {/* Timeframe & Chart Style Switches */}
        <div className="flex items-center gap-2">
          {/* Timeframes */}
          <div className="inline-flex rounded-lg border border-rule bg-paper p-0.5">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${timeframe === tf ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type */}
          <div className="inline-flex rounded-lg border border-rule bg-paper p-0.5">
            <button
              onClick={() => setChartType('candles')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'candles' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
              title="Candlestick Chart"
            >
              <Icon name="bar-chart-2" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md transition-colors ${chartType === 'line' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
              title="Line Chart"
            >
              <Icon name="trending-up" className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicators dropdown / toggles */}
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setIndicators(prev => ({ ...prev, vwap: !prev.vwap }))}
              className={`px-2 py-1 text-[10.5px] font-bold rounded border ${indicators.vwap ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'border-rule text-ink-faint'}`}
            >
              VWAP
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, ema: !prev.ema }))}
              className={`px-2 py-1 text-[10.5px] font-bold rounded border ${indicators.ema ? 'bg-blue-500/10 border-blue-500/40 text-blue-500' : 'border-rule text-ink-faint'}`}
            >
              EMA 9/21
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, rsi: !prev.rsi }))}
              className={`px-2 py-1 text-[10.5px] font-bold rounded border ${indicators.rsi ? 'bg-purple-500/10 border-purple-500/40 text-purple-500' : 'border-rule text-ink-faint'}`}
            >
              RSI
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Chart Canvas (Left) + Order Book & Execution Ticket (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Candlestick Chart */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-rule bg-panel p-5 relative overflow-hidden">
            {/* Active Candle Legend Header */}
            {activeCandle && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[12px] font-mono text-ink-soft">
                <span>O: <strong className="text-ink">₹{fmtPrice(activeCandle.o)}</strong></span>
                <span>H: <strong className="text-up">₹{fmtPrice(activeCandle.h)}</strong></span>
                <span>L: <strong className="text-down">₹{fmtPrice(activeCandle.l)}</strong></span>
                <span>C: <strong className="text-ink">₹{fmtPrice(activeCandle.c)}</strong></span>
                <span>Vol: <strong className="text-ink">{fmtVolume(activeCandle.volume)}</strong></span>
                {indicators.ema && (
                  <>
                    <span className="text-blue-500">EMA9: {fmtPrice(activeCandle.ema9)}</span>
                    <span className="text-amber-500">EMA21: {fmtPrice(activeCandle.ema21)}</span>
                  </>
                )}
              </div>
            )}

            {/* SVG Chart Engine */}
            <div className="relative w-full overflow-hidden select-none" style={{ height: `${chartHeight + (indicators.rsi ? rsiHeight + 25 : 0)}px` }}>
              <svg
                className="w-full h-full"
                viewBox={`0 0 800 ${chartHeight + (indicators.rsi ? rsiHeight + 25 : 0)}`}
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? 'var(--up)' : 'var(--down)'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isUp ? 'var(--up)' : 'var(--down)'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                  <g key={ratio}>
                    <line
                      x1="0"
                      y1={chartHeight * ratio}
                      x2="740"
                      y2={chartHeight * ratio}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="745"
                      y={chartHeight * ratio + 4}
                      fill="currentColor"
                      fillOpacity="0.45"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {fmtPrice(maxPrice - ratio * priceRange)}
                    </text>
                  </g>
                ))}

                {/* VWAP Line */}
                {indicators.vwap && (
                  <line
                    x1="0"
                    y1={getY(vwapLine)}
                    x2="740"
                    y2={getY(vwapLine)}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* EMA 9 Line */}
                {indicators.ema && (
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    points={candlesWithIndicators.map((c, i) => `${(i / (candlesWithIndicators.length - 1)) * 730},${getY(c.ema9)}`).join(' ')}
                  />
                )}

                {/* EMA 21 Line */}
                {indicators.ema && (
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    points={candlesWithIndicators.map((c, i) => `${(i / (candlesWithIndicators.length - 1)) * 730},${getY(c.ema21)}`).join(' ')}
                  />
                )}

                {/* Render Chart (Candles or Line) */}
                {chartType === 'candles' ? (
                  candlesWithIndicators.map((c, i) => {
                    const x = (i / (candlesWithIndicators.length - 1)) * 730
                    const candleW = 12
                    const openY = getY(c.o)
                    const closeY = getY(c.c)
                    const highY = getY(c.h)
                    const lowY = getY(c.l)
                    const isGreen = c.c >= c.o
                    const bodyTop = Math.min(openY, closeY)
                    const bodyH = Math.max(2, Math.abs(openY - closeY))

                    return (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                      >
                        {/* Upper & lower wick */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={isGreen ? 'var(--up)' : 'var(--down)'}
                          strokeWidth="1.5"
                        />
                        {/* Candle body */}
                        <rect
                          x={x - candleW / 2}
                          y={bodyTop}
                          width={candleW}
                          height={bodyH}
                          fill={isGreen ? 'var(--up)' : 'var(--down)'}
                          rx="1"
                        />
                        {/* Interactive hover zone */}
                        <rect
                          x={x - 12}
                          y="0"
                          width="24"
                          height={chartHeight}
                          fill="transparent"
                        />
                      </g>
                    )
                  })
                ) : (
                  <>
                    <polygon
                      fill="url(#chartGradient)"
                      points={`0,${chartHeight} ${candlesWithIndicators.map((c, i) => `${(i / (candlesWithIndicators.length - 1)) * 730},${getY(c.c)}`).join(' ')} 730,${chartHeight}`}
                    />
                    <polyline
                      fill="none"
                      stroke={isUp ? 'var(--up)' : 'var(--down)'}
                      strokeWidth="2.5"
                      points={candlesWithIndicators.map((c, i) => `${(i / (candlesWithIndicators.length - 1)) * 730},${getY(c.c)}`).join(' ')}
                    />
                  </>
                )}

                {/* RSI Sub-Panel */}
                {indicators.rsi && (
                  <g transform={`translate(0, ${chartHeight + 20})`}>
                    <line x1="0" y1="0" x2="740" y2="0" stroke="currentColor" strokeOpacity="0.12" />
                    {/* RSI 70 & 30 bands */}
                    <line x1="0" y1={getRsiY(70)} x2="740" y2={getRsiY(70)} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity="0.4" />
                    <line x1="0" y1={getRsiY(30)} x2="740" y2={getRsiY(30)} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity="0.4" />
                    <text x="745" y={getRsiY(70) + 3} fill="#ef4444" fontSize="9" fontFamily="monospace">70</text>
                    <text x="745" y={getRsiY(30) + 3} fill="#22c55e" fontSize="9" fontFamily="monospace">30</text>
                    {/* RSI Curve */}
                    <polyline
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                      points={rsiData.map((val, i) => `${(i / (rsiData.length - 1)) * 730},${getRsiY(val)}`).join(' ')}
                    />
                    <text x="10" y="14" fill="#a855f7" fontSize="10" fontWeight="bold">RSI (14): {Math.round(rsiData[rsiData.length - 1] || 50)}</text>
                  </g>
                )}

                {/* Crosshair indicator */}
                {hoveredIndex !== null && (
                  <g>
                    <line
                      x1={(hoveredIndex / (candlesWithIndicators.length - 1)) * 730}
                      y1="0"
                      x2={(hoveredIndex / (candlesWithIndicators.length - 1)) * 730}
                      y2={chartHeight}
                      stroke="currentColor"
                      strokeOpacity="0.4"
                      strokeDasharray="3 3"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Positions & Execution History Cockpit */}
          <div className="rounded-xl border border-rule bg-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[15px] text-ink flex items-center gap-2">
                <Icon name="layers" className="w-4 h-4 text-ink-soft" />
                Open Simulated Positions ({positions.length})
              </h3>
              {positions.length > 0 && (
                <button
                  onClick={() => setPositions([])}
                  className="text-[11px] font-bold text-ink-faint hover:text-down transition-colors"
                >
                  Square Off All
                </button>
              )}
            </div>

            {positions.length === 0 ? (
              <div className="py-8 text-center text-ink-faint text-[13px]">
                No open positions. Use the order ticket on the right to enter mock intraday or delivery trades.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-rule text-ink-faint text-[11px] uppercase tracking-wider">
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Instrument</th>
                      <th className="pb-2">Side</th>
                      <th className="pb-2">Product</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Avg Price</th>
                      <th className="pb-2 text-right">LTP</th>
                      <th className="pb-2 text-right">Unrealized P&L</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule font-mono">
                    {positions.map((pos) => {
                      const curLtp = pos.sym === selectedSym ? quote.ltp : (BY_SYMBOL[pos.sym]?.base || pos.entryPrice)
                      const diff = pos.side === 'buy' ? (curLtp - pos.entryPrice) : (pos.entryPrice - curLtp)
                      const pnl = diff * pos.qty
                      const pnlPct = (diff / pos.entryPrice) * 100
                      const pnlUp = pnl >= 0

                      return (
                        <tr key={pos.id} className="hover:bg-paper/50 transition-colors">
                          <td className="py-2.5 text-ink-faint font-sans">{pos.time}</td>
                          <td className="py-2.5 font-bold font-sans text-ink">{pos.sym}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold font-sans uppercase ${pos.side === 'buy' ? 'bg-up-soft text-up' : 'bg-down-soft text-down'}`}>
                              {pos.side}
                            </span>
                          </td>
                          <td className="py-2.5 uppercase text-ink-soft font-sans">{pos.product}</td>
                          <td className="py-2.5 text-right text-ink">{pos.qty}</td>
                          <td className="py-2.5 text-right text-ink">₹{fmtPrice(pos.entryPrice)}</td>
                          <td className="py-2.5 text-right text-ink">₹{fmtPrice(curLtp)}</td>
                          <td className={`py-2.5 text-right font-bold ${pnlUp ? 'text-up' : 'text-down'}`}>
                            {pnl >= 0 ? '+' : '−'}₹{fmtPrice(Math.abs(pnl))} ({fmtPct(pnlPct)})
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleClosePosition(pos.id)}
                              className="px-2.5 py-1 text-[11px] font-sans font-bold rounded bg-paper hover:bg-down-soft hover:text-down border border-rule transition-colors"
                            >
                              Exit
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Level 2 Depth & Order Ticket */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Placement Ticket */}
          <div className="rounded-xl border border-rule bg-panel p-5">
            <div className="flex rounded-lg bg-paper p-1 border border-rule mb-5">
              <button
                type="button"
                onClick={() => setOrderSide('buy')}
                className={`flex-1 py-2 text-[12.5px] font-bold rounded-md transition-all ${orderSide === 'buy' ? 'bg-up text-white shadow-sm' : 'text-ink-soft hover:text-ink'}`}
              >
                BUY {selectedSym}
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('sell')}
                className={`flex-1 py-2 text-[12.5px] font-bold rounded-md transition-all ${orderSide === 'sell' ? 'bg-down text-white shadow-sm' : 'text-ink-soft hover:text-ink'}`}
              >
                SELL {selectedSym}
              </button>
            </div>

            {orderSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-up-soft text-up text-[12px] font-bold animate-[fadeIn_0.3s]">
                {orderSuccess}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Product Type (MIS vs CNC) */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProductType('mis')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded border ${productType === 'mis' ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-soft'}`}
                >
                  Intraday (MIS 5x)
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('cnc')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded border ${productType === 'cnc' ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-soft'}`}
                >
                  Delivery (CNC)
                </button>
              </div>

              {/* Order Type (Market vs Limit) */}
              <div className="flex gap-2">
                {['market', 'limit', 'sl'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`flex-1 py-1 text-[11px] font-bold uppercase rounded border ${orderType === type ? 'border-rule bg-paper text-ink font-extrabold' : 'border-transparent text-ink-faint'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Quantity Input with Multipliers */}
              <div>
                <div className="flex justify-between items-center text-[12px] font-bold text-ink-soft mb-1.5">
                  <span>Quantity</span>
                  <div className="flex gap-1">
                    {[25, 50, 100].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setQty(prev => prev + n)}
                        className="px-1.5 py-0.5 rounded bg-paper border border-rule text-[10px] text-ink hover:border-ink"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[14.5px] text-ink focus:outline-none focus:border-ink"
                />
              </div>

              {/* Limit Price Input if type !== market */}
              {orderType !== 'market' && (
                <div>
                  <label className="block text-[12px] font-bold text-ink-soft mb-1.5">
                    Limit Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[14.5px] text-ink focus:outline-none focus:border-ink"
                  />
                </div>
              )}

              {/* Margin Required & Leverage Calculation */}
              <div className="p-3 rounded-lg bg-paper border border-rule text-[12px] space-y-1">
                <div className="flex justify-between text-ink-soft">
                  <span>Margin Required</span>
                  <span className="font-mono font-bold text-ink">
                    ₹{fmtPrice((quote.ltp * qty) / (productType === 'mis' ? 5 : 1))}
                  </span>
                </div>
                <div className="flex justify-between text-ink-faint text-[11px]">
                  <span>Order Value</span>
                  <span className="font-mono">₹{fmtPrice(quote.ltp * qty)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-bold text-[13px] tracking-wide text-white uppercase transition-opacity shadow-sm ${orderSide === 'buy' ? 'bg-up hover:opacity-90' : 'bg-down hover:opacity-90'}`}
              >
                Place {orderSide.toUpperCase()} Order
              </button>
            </form>
          </div>

          {/* Level 2 Market Depth (Best 5 Bids vs Asks) */}
          <div className="rounded-xl border border-rule bg-panel p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[13px] uppercase tracking-wider text-ink flex items-center gap-2">
                <Icon name="bar-chart" className="w-4 h-4 text-ink-soft" />
                Market Depth (L2)
              </h3>
              <span className="text-[11px] font-mono text-ink-faint">Spread: ₹0.35</span>
            </div>

            {/* Buyer vs Seller Ratio Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span className="text-up">{depth.buyRatio}% Buyers</span>
                <span className="text-down">{100 - depth.buyRatio}% Sellers</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-down-soft overflow-hidden flex">
                <div className="h-full bg-up" style={{ width: `${depth.buyRatio}%` }} />
              </div>
            </div>

            {/* Depth Table */}
            <div className="grid grid-cols-2 gap-3 text-[11.5px] font-mono">
              {/* Bids */}
              <div>
                <div className="grid grid-cols-3 text-ink-faint font-sans text-[10px] uppercase pb-1 border-b border-rule">
                  <span>Orders</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Bid</span>
                </div>
                <div className="divide-y divide-rule/40">
                  {depth.bids.map((b, i) => (
                    <div key={i} className="grid grid-cols-3 py-1 text-ink-soft">
                      <span>{b.orders}</span>
                      <span className="text-right text-ink">{b.qty}</span>
                      <span className="text-right font-bold text-up">₹{fmtPrice(b.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asks */}
              <div>
                <div className="grid grid-cols-3 text-ink-faint font-sans text-[10px] uppercase pb-1 border-b border-rule">
                  <span>Ask</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Orders</span>
                </div>
                <div className="divide-y divide-rule/40">
                  {depth.asks.map((a, i) => (
                    <div key={i} className="grid grid-cols-3 py-1 text-ink-soft">
                      <span className="font-bold text-down">₹{fmtPrice(a.price)}</span>
                      <span className="text-right text-ink">{a.qty}</span>
                      <span className="text-right">{a.orders}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
