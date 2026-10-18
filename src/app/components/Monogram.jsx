/*
 * Ticker monogram — a bordered square carrying the instrument's short name.
 * Stands in for brand marks, which we don't ship; the type shrinks as the
 * label grows so both "AU" and "SUNPHARMA" sit centred in the same box.
 */

const SIZES = {
  lg: { box: 'w-11 h-11 rounded-lg', px: 44 },
  md: { box: 'w-8 h-8 rounded-md', px: 32 },
  sm: { box: 'w-[22px] h-[22px] rounded-[5px]', px: 22 },
}

export default function Monogram({ text, size = 'lg', className = '' }) {
  const { box, px } = SIZES[size] ?? SIZES.lg
  const label = String(text || '').replace(/[^A-Z0-9&-]/gi, '').toUpperCase()

  /*
   * Fit to the box width, then clamp. 0.68 is the measured advance width of a
   * bold Plus Jakarta capital — assuming a narrower glyph overflows the box on
   * the long tickers (BANDHANBNK, IDFCFIRSTB).
   */
  const fitted = (px * 0.82) / Math.max(label.length, 1) / 0.68
  const floor = size === 'sm' ? 4.5 : 5
  const ceiling = size === 'sm' ? 9 : size === 'md' ? 11 : 14
  const fontSize = Math.max(floor, Math.min(ceiling, fitted))

  return (
    <span
      className={`shrink-0 inline-flex items-center justify-center border border-rule bg-paper text-ink font-bold tracking-tight leading-none overflow-hidden ${box} ${className}`}
      style={{ fontSize: `${fontSize.toFixed(1)}px` }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}
