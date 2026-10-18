import { BANKS, COMPANIES } from '../../lib/market/universe'
import { SelectionProvider } from './selection'
import MarketOverview from './MarketOverview'
import HeatMap from './HeatMap'
import AnalysisConsole from './console/AnalysisConsole'
import ConstituentGrid from './constituents/ConstituentGrid'

export default function Dashboard() {
  return (
    <SelectionProvider>
      <div className="px-5 md:px-8 py-8 md:py-10 space-y-12 md:space-y-16">
        <MarketOverview />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] gap-6">
          <HeatMap
            title="Banks Weight Heat Map"
            subtitle="Weighted BankNifty block sizes with real-time trends"
            universe={BANKS}
            basis={122}
          />
          <HeatMap
            title="Companies Weight Heat Map"
            subtitle="Weighted Nifty 50 block sizes with real-time trends"
            universe={COMPANIES}
            basis={74}
            dense
          />
        </div>

        <AnalysisConsole />

        <ConstituentGrid
          title="BankNifty Constituent Stocks"
          subtitle="Tick-by-tick real-time pricing for banking components"
          universe={BANKS}
          hint="Every stock in the NIFTY BANK index. Star one to watch it, or open it in the analysis console above."
        />
      </div>
    </SelectionProvider>
  )
}
