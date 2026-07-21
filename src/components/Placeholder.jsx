/*
 * Reserved frame for final illustration assets (noir engravings, walker,
 * handshake). Swap the inner content for an <img> when assets arrive —
 * the frame, ratio and reveal animation stay the same.
 */
export default function Placeholder({ label = 'ILLUSTRATION', className = '', ratio }) {
  return (
    <div
      data-asset-slot={label}
      style={ratio ? { aspectRatio: ratio } : undefined}
      className={`relative overflow-hidden rounded-2xl border border-rule bg-panel ${className}`}
    >
      {/* diagonal hatch */}
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.07]">
        <defs>
          <pattern id={`hatch-${label}`} width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#hatch-${label})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-ink-faint border border-rule rounded-full px-4 py-2 bg-paper/80">
          {label} — asset tbd
        </span>
      </div>
    </div>
  )
}
