import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { NEWS, timeAgo } from '../../lib/market/news'
import Icon from '../../components/Icon'

const EXTENDED_NEWS = [
  ...NEWS,
  {
    id: 'fii-buying-surge',
    headline: 'FIIs Turn Net Buyers with ₹2,450 Cr Inflow as Banking Heavyweights Rally',
    source: 'Moneycontrol Wire',
    agoMinutes: 45,
    sentiment: 'bullish',
    tickers: ['HDFCBANK', 'ICICIBANK', 'SBIN'],
    category: 'FII / DII Activity'
  },
  {
    id: 'reliance-telecom-arpu',
    headline: 'Reliance Jio Reports 11% ARPU Expansion Following Tariff Rationalization',
    source: 'Economic Times',
    agoMinutes: 80,
    sentiment: 'bullish',
    tickers: ['RELIANCE', 'BHARTIARTL'],
    category: 'Earnings & Filings'
  },
  {
    id: 'tcs-ai-contracts',
    headline: 'TCS Signs Multi-Million Dollar Cloud & Generative AI Modernization Deal',
    source: 'Reuters Financial',
    agoMinutes: 130,
    sentiment: 'bullish',
    tickers: ['TCS', 'INFY'],
    category: 'IT & Tech'
  },
  {
    id: 'crude-oil-drop',
    headline: 'Brent Crude Slips Below $74/bbl; Favorable Tailwinds for Indian Refiners & Paints',
    source: 'Bloomberg Quint',
    agoMinutes: 210,
    sentiment: 'bullish',
    tickers: ['ASIANPAINT', 'ONGC'],
    category: 'Macro & Commodities'
  },
  {
    id: 'sebi-fo-lot-size',
    headline: 'SEBI Consults on Increasing Index Options Contract Sizes to Curb Excessive Intraday Speculation',
    source: 'SEBI Circular',
    agoMinutes: 290,
    sentiment: 'neutral',
    tickers: ['BANKNIFTY', 'NIFTY50'],
    category: 'Regulatory'
  },
  {
    id: 'tatamotors-ev-guidance',
    headline: 'Tata Motors Highlights Strong Domestic Commercial Vehicle Bookings in Monthly Disclosure',
    source: 'Exchange Filing',
    agoMinutes: 340,
    sentiment: 'bullish',
    tickers: ['TATAMOTORS', 'M&M'],
    category: 'Auto & Metals'
  },
  {
    id: 'metal-prices-pressure',
    headline: 'China Demand Slump Puts Pressure on Global HRC Steel Prices; Margins in Focus',
    source: 'Metal Bulletin',
    agoMinutes: 420,
    sentiment: 'bearish',
    tickers: ['TATASTEEL', 'JSWSTEEL'],
    category: 'Auto & Metals'
  }
]

const CATEGORIES = ['All News', 'FII / DII Activity', 'Earnings & Filings', 'Regulatory', 'IT & Tech', 'Auto & Metals', 'Macro & Commodities']

export default function MarketNewsPage() {
  const [activeCategory, setActiveCategory] = useState('All News')
  const [search, setSearch] = useState('')

  const filteredNews = useMemo(() => {
    return EXTENDED_NEWS.filter(item => {
      if (activeCategory !== 'All News' && item.category !== activeCategory) {
        return false
      }
      if (search) {
        const q = search.toLowerCase()
        const matchTitle = item.headline.toLowerCase().includes(q)
        const matchSource = item.source.toLowerCase().includes(q)
        const matchTicker = item.tickers?.some(t => t.toLowerCase().includes(q))
        return matchTitle || matchSource || matchTicker
      }
      return true
    })
  }, [activeCategory, search])

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl lg:text-3xl tracking-tight text-ink flex items-center gap-3">
            <Icon name="newspaper" className="w-6 h-6 text-accent" />
            Market News & Filings Wire
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Real-time regulatory disclosures, earnings updates, and macro drivers threaded against Nifty constituents.
          </p>
        </div>

        {/* Live Wire Pulse */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rule bg-panel text-[12px] font-mono text-ink-soft">
          <span className="w-2 h-2 rounded-full bg-up animate-ping" />
          <span>Real-time Wire Active</span>
        </div>
      </div>

      {/* Top Cards: Institutional Flows & Market Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* FII Flow Card */}
        <div className="rounded-xl border border-rule bg-panel p-5">
          <div className="flex items-center justify-between text-ink-soft text-[12px] font-bold uppercase tracking-wider mb-2">
            <span>FII Net Inflow (Provisional)</span>
            <Icon name="trending-up" className="w-4 h-4 text-up" />
          </div>
          <div className="font-serif font-bold text-2xl text-up tabular-nums">+₹2,450.80 Cr</div>
          <div className="mt-1 text-[11.5px] text-ink-faint">Consecutive 3rd session of positive institutional buying</div>
        </div>

        {/* DII Flow Card */}
        <div className="rounded-xl border border-rule bg-panel p-5">
          <div className="flex items-center justify-between text-ink-soft text-[12px] font-bold uppercase tracking-wider mb-2">
            <span>DII Net Inflow (Domestic Funds)</span>
            <Icon name="trending-up" className="w-4 h-4 text-up" />
          </div>
          <div className="font-serif font-bold text-2xl text-up tabular-nums">+₹1,890.15 Cr</div>
          <div className="mt-1 text-[11.5px] text-ink-faint">Strong SIP support absorbing market volatility</div>
        </div>

        {/* India VIX & Sentiment */}
        <div className="rounded-xl border border-rule bg-panel p-5">
          <div className="flex items-center justify-between text-ink-soft text-[12px] font-bold uppercase tracking-wider mb-2">
            <span>India VIX (Volatility)</span>
            <Icon name="activity" className="w-4 h-4 text-ink-soft" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-ink tabular-nums">13.42</span>
            <span className="text-[12px] font-bold text-down">−4.2% (Low Fear)</span>
          </div>
          <div className="mt-1 text-[11.5px] text-ink-faint">Options writing favored; range-bound expected</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-rule bg-panel">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-ink text-paper' : 'bg-paper text-ink-soft hover:text-ink border border-rule'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Icon name="search" className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news or ticker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-paper border border-rule rounded-lg pl-9 pr-3 py-1.5 text-[13px] text-ink focus:outline-none focus:border-ink placeholder:text-ink-faint"
          />
        </div>
      </div>

      {/* News Feed Stream */}
      <div className="space-y-3">
        {filteredNews.map((item) => {
          const isBull = item.sentiment === 'bullish'
          const isBear = item.sentiment === 'bearish'
          const sentimentClass = isBull ? 'bg-up-soft text-up border-up/20' : isBear ? 'bg-down-soft text-down border-down/20' : 'bg-paper text-ink-soft border-rule'

          return (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-rule bg-panel hover:border-ink-soft transition-all space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[12px] text-ink">{item.source}</span>
                  <span className="text-ink-faint text-[11px]">·</span>
                  <span className="text-ink-faint text-[11px] font-mono">{timeAgo(item.agoMinutes)}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sentimentClass}`}>
                    {item.sentiment || 'neutral'}
                  </span>
                </div>

                {/* Ticker Badges */}
                {item.tickers && (
                  <div className="flex items-center gap-1.5">
                    {item.tickers.map((t) => (
                      <Link
                        key={t}
                        to={`/app/trading?sym=${t}`}
                        className="px-2 py-0.5 rounded bg-paper hover:bg-ink hover:text-paper border border-rule text-[11px] font-mono font-bold text-ink transition-colors"
                      >
                        ${t}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <h2 className="font-bold text-[16px] text-ink leading-snug group-hover:text-accent transition-colors">
                {item.headline}
              </h2>
            </div>
          )
        })}
      </div>
    </div>
  )
}
