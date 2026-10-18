import { useQuote, useCandle } from '../../../lib/market/provider'
import { fmtRupee, fmtCount } from '../../../lib/format'
import Icon from '../../../components/Icon'

/*
 * Everything the console knows about one instrument on one timeframe.
 *
 * Open/High/Low/Close and traded volume move with the timeframe rail; the
 * blocks below them are technical overlays, shown only while their indicator
 * is switched on.
 */

function Row({ label, value, tone = 'ink' }) {
  const toneClass =
    tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-ink'
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-rule last:border-b-0">
      <span className="text-[13.5px] text-ink-soft">{label}</span>
      <span className={`text-[14px] font-semibold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  )
}

function Block({ children }) {
  return <div className="py-1.5 border-b border-rule last:border-b-0">{children}</div>
}

export default function MetricsSummary({ symbol, timeframe, indicators }) {
  const q = useQuote(symbol)
  const candle = useCandle(symbol, timeframe)
  if (!q || !candle) return null

  return (
    <section data-card className="rounded-2xl border border-rule bg-panel p-5 md:p-6">
      <header className="flex items-center gap-2.5 pb-4 border-b border-rule">
        <Icon name="chart-column" className="w-[18px] h-[18px] text-ink" />
        <h3 className="font-serif font-semibold text-[19px] tracking-tight">
          Constituent Metrics Summary
        </h3>
      </header>

      <Block>
        <Row label="Open" value={fmtRupee(candle.open)} />
        <Row label="High" value={fmtRupee(candle.high)} tone="up" />
        <Row label="Low" value={fmtRupee(candle.low)} tone="down" />
        <Row label="Close" value={fmtRupee(candle.close)} />
      </Block>

      <Block>
        {/* both are share counts — they read side by side, so they match */}
        <Row label="Traded Volume" value={fmtCount(candle.volume)} />
        <Row label="Average Volume" value={fmtCount(q.avgVolume)} />
      </Block>

      {indicators.range52 && (
        <Block>
          <Row label="52 Week High" value={fmtRupee(q.week52High)} tone="up" />
          <Row label="52 Week Low" value={fmtRupee(q.week52Low)} tone="down" />
        </Block>
      )}

      {indicators.levels && (
        <Block>
          <Row label="Support Level" value={fmtRupee(q.support)} tone="up" />
          <Row label="Resistance Level" value={fmtRupee(q.resistance)} tone="down" />
        </Block>
      )}

      {indicators.vwap && (
        <Block>
          <Row label="VWAP" value={fmtRupee(q.vwap)} />
        </Block>
      )}

      {indicators.dayRange && (
        <Block>
          <Row
            label="Day Range"
            value={`${fmtRupee(q.low)} — ${fmtRupee(q.high)}`}
          />
        </Block>
      )}
    </section>
  )
}
