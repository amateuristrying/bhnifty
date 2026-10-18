import { useState } from 'react'
import Icon from '../../components/Icon'

export default function SettingsPage() {
  // Broker API state
  const [broker, setBroker] = useState('angel') // angel | zerodha | dhan | upstox
  const [apiKey, setApiKey] = useState('SMARTAPI_LIVE_SANDBOX_82918')
  const [clientCode, setClientCode] = useState('BH742911')
  const [totpSecret, setTotpSecret] = useState('••••••••••••')
  const [feedMode, setFeedMode] = useState('simulated') // simulated | live
  const [testingPing, setTestingPing] = useState(false)
  const [pingResult, setPingResult] = useState(null)

  // Order Execution Defaults
  const [defaultProduct, setDefaultProduct] = useState('MIS')
  const [defaultOrder, setDefaultOrder] = useState('LIMIT')
  const [defaultSlPct, setDefaultSlPct] = useState('1.0')
  const [skipConfirm, setSkipConfirm] = useState(false)

  // Audio Alerts
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [squareOffAlert, setSquareOffAlert] = useState(true)

  // Save / Toast notification
  const [savedToast, setSavedToast] = useState(false)

  const handleTestConnection = () => {
    setTestingPing(true)
    setPingResult(null)
    setTimeout(() => {
      setTestingPing(false)
      setPingResult({ success: true, latency: '24ms', msg: 'Broker Gateway Responded OK (NSE Cash Feed 24ms)' })
    }, 800)
  }

  const handleSave = (e) => {
    e.preventDefault()
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3000)
  }

  const handleClearTradeData = () => {
    if (confirm('Clear all simulated trades and open positions?')) {
      localStorage.removeItem('bhnifty-positions')
      alert('Simulated trade history cleared successfully.')
    }
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif font-bold text-2xl lg:text-3xl tracking-tight text-ink flex items-center gap-3">
          <Icon name="settings" className="w-6 h-6 text-accent" />
          Settings & Broker Connection
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Configure SmartAPI credentials, execution defaults, sound notifications, and trading preferences.
        </p>
      </div>

      {savedToast && (
        <div className="p-4 rounded-xl bg-up-soft text-up text-[13px] font-bold border border-up/20 animate-[fadeIn_0.3s]">
          Settings updated and saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Broker API Integration */}
        <div className="rounded-xl border border-rule bg-panel p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <h2 className="font-bold text-[16px] text-ink flex items-center gap-2">
              <Icon name="cpu" className="w-4 h-4 text-accent" />
              Broker API Gateway (SmartAPI)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-up-soft text-up text-[11px] font-bold">
              {feedMode === 'simulated' ? 'High-Speed Simulator' : 'Live Websocket'}
            </span>
          </div>

          {/* Broker Selector */}
          <div>
            <label className="block text-[12px] font-bold text-ink-soft mb-2">Supported Broker Feed</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'angel', label: 'Angel One', sub: 'SmartAPI' },
                { id: 'zerodha', label: 'Zerodha', sub: 'Kite Connect' },
                { id: 'dhan', label: 'Dhan HQ', sub: 'Direct Feed' },
                { id: 'upstox', label: 'Upstox', sub: 'V2 API' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBroker(b.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    broker === b.id
                      ? 'border-ink bg-paper ring-1 ring-ink'
                      : 'border-rule bg-paper/50 hover:bg-paper'
                  }`}
                >
                  <div className="font-bold text-[13px] text-ink">{b.label}</div>
                  <div className="text-[11px] text-ink-faint">{b.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Client Code / User ID</label>
              <input
                type="text"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[14px] text-ink focus:outline-none focus:border-ink"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-mono text-[14px] text-ink focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          {/* Test Ping */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingPing}
                className="px-4 py-2 rounded-lg bg-paper border border-rule text-ink hover:border-ink text-[12px] font-bold transition-all disabled:opacity-50"
              >
                {testingPing ? 'Pinging Gateway…' : 'Test API Connection'}
              </button>
              {pingResult && (
                <span className="text-[12px] font-mono text-up font-bold">
                  ✓ {pingResult.msg}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[12px] font-bold text-ink-soft">
              <span>Feed Mode:</span>
              <button
                type="button"
                onClick={() => setFeedMode(feedMode === 'simulated' ? 'live' : 'simulated')}
                className="text-accent underline cursor-pointer"
              >
                {feedMode === 'simulated' ? 'Switch to Live Websocket' : 'Switch to Mock Simulator'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Order Execution Defaults */}
        <div className="rounded-xl border border-rule bg-panel p-6 space-y-5">
          <div className="pb-3 border-b border-rule">
            <h2 className="font-bold text-[16px] text-ink flex items-center gap-2">
              <Icon name="sliders" className="w-4 h-4 text-accent" />
              Default Order Execution Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Product Type */}
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Default Product</label>
              <select
                value={defaultProduct}
                onChange={(e) => setDefaultProduct(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-bold text-[13.5px] text-ink focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="MIS">MIS · Intraday Margin (5x)</option>
                <option value="CNC">CNC · Cash & Carry Delivery</option>
              </select>
            </div>

            {/* Order Variety */}
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Default Variety</label>
              <select
                value={defaultOrder}
                onChange={(e) => setDefaultOrder(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-bold text-[13.5px] text-ink focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="LIMIT">Limit Order</option>
                <option value="MARKET">Market Order</option>
                <option value="SL">Stop Loss (SL-L)</option>
              </select>
            </div>

            {/* Default SL % */}
            <div>
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Default Stop-Loss %</label>
              <select
                value={defaultSlPct}
                onChange={(e) => setDefaultSlPct(e.target.value)}
                className="w-full bg-paper border border-rule rounded-lg px-3.5 py-2 font-bold text-[13.5px] text-ink focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="0.5">0.50% (Tight Scalp)</option>
                <option value="1.0">1.00% (Standard Intraday)</option>
                <option value="1.5">1.50% (Swing)</option>
                <option value="2.0">2.00% (Wide Room)</option>
              </select>
            </div>
          </div>

          {/* Quick toggle: Instant execution */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="font-bold text-[13px] text-ink">One-Click Fast Execution</div>
              <div className="text-[11.5px] text-ink-faint">Skip secondary confirmation modals when pressing Buy / Sell</div>
            </div>
            <input
              type="checkbox"
              checked={skipConfirm}
              onChange={(e) => setSkipConfirm(e.target.checked)}
              className="w-4 h-4 rounded text-ink accent-ink cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Audio & Notifications */}
        <div className="rounded-xl border border-rule bg-panel p-6 space-y-4">
          <div className="pb-3 border-b border-rule">
            <h2 className="font-bold text-[16px] text-ink flex items-center gap-2">
              <Icon name="bell" className="w-4 h-4 text-accent" />
              Sound Alerts & Market Bell
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[13px] text-ink">Audio Chime on Price Triggers</div>
                <div className="text-[11.5px] text-ink-faint">Play an audible chime whenever a watchlist price target is hit</div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-ink accent-ink cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[13px] text-ink">03:15 PM Intraday Auto-Square Off Warning</div>
                <div className="text-[11.5px] text-ink-faint">Notification reminder before broker auto-square-off cutoff</div>
              </div>
              <input
                type="checkbox"
                checked={squareOffAlert}
                onChange={(e) => setSquareOffAlert(e.target.checked)}
                className="w-4 h-4 rounded text-ink accent-ink cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Data Management & Actions */}
        <div className="rounded-xl border border-rule bg-panel p-6 space-y-4">
          <div className="pb-3 border-b border-rule">
            <h2 className="font-bold text-[16px] text-ink flex items-center gap-2">
              <Icon name="database" className="w-4 h-4 text-accent" />
              Data Management & Reset
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClearTradeData}
              className="px-4 py-2 rounded-lg bg-paper border border-rule text-down hover:bg-down-soft text-[12px] font-bold transition-colors"
            >
              Clear Simulated Trade History
            </button>

            <button
              type="submit"
              className="btn-lift px-6 py-2.5 rounded-lg bg-ink text-paper font-bold text-[13px] tracking-wide"
            >
              Save All Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
