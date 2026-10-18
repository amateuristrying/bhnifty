import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, motionOK } from '../../lib/motion'
import { useIndex, useSeries } from '../../lib/market/provider'
import { fmtAxis, fmtPrice, fmtStamp, fmtPct } from '../../lib/format'

/* plot inset — right gutter carries the value axis, bottom the time axis */
const PAD = { top: 14, right: 62, bottom: 28, left: 2 }
const NICE_STEPS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000]

/* Round tick values that land near the data, never more than four of them */
function axisTicks(min, max) {
  const span = max - min || 1
  const step = NICE_STEPS.find((s) => span / s <= 3.2) ?? NICE_STEPS.at(-1)
  const out = []
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) out.push(v)
  return out
}

export default function IndexChart({ indexKey, range, live }) {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const lineRef = useRef(null)
  const areaRef = useRef(null)
  const cursorRef = useRef(null)
  const tipRef = useRef(null)
  const moveX = useRef(null)

  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState(null) // index into `points`
  const idx = useIndex(indexKey)
  const series = useSeries(indexKey, range)

  const height = width < 640 ? 200 : 260

  /*
   * The chart owns its width; the card owns everything else. Measured
   * synchronously before paint so the first frame is already drawn — waiting
   * on the observer's first callback leaves an empty gap where the chart goes.
   */
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* An open market drags the last point along with the live level */
  const points = useMemo(() => {
    if (!live || range !== '1D') return series
    const out = series.slice()
    out[out.length - 1] = { ...out[out.length - 1], v: idx.ltp }
    return out
  }, [series, live, range, idx.ltp])

  const geo = useMemo(() => {
    if (!width || !points.length) return null

    const plotW = Math.max(1, width - PAD.left - PAD.right)
    const plotH = Math.max(1, height - PAD.top - PAD.bottom)

    const vals = points.map((p) => p.v)
    /* the previous close is always in frame, so the benchmark line is visible */
    const rawMin = Math.min(...vals, idx.prevClose)
    const rawMax = Math.max(...vals, idx.prevClose)
    const pad = (rawMax - rawMin || rawMax * 0.002) * 0.18
    const vmin = rawMin - pad
    const vmax = rawMax + pad

    const t0 = points[0].t
    const t1 = points[points.length - 1].t
    const x = (t) => PAD.left + ((t - t0) / (t1 - t0 || 1)) * plotW
    const y = (v) => PAD.top + (1 - (v - vmin) / (vmax - vmin)) * plotH

    const coords = points.map((p) => [x(p.t), y(p.v)])
    const line = 'M' + coords.map(([cx, cy]) => `${cx.toFixed(1)},${cy.toFixed(1)}`).join(' L')
    const base = PAD.top + plotH
    const area = `${line} L${coords.at(-1)[0].toFixed(1)},${base} L${coords[0][0].toFixed(1)},${base} Z`

    /* clean hour marks intraday; evenly spaced stamps on the longer ranges */
    let tickIdx
    if (range === '1D') {
      const hours = points.reduce((acc, p, i) => {
        if (new Date(p.t).getUTCMinutes() === 0) acc.push(i)
        return acc
      }, [])
      /*
       * Wide enough, and the 09:15 bell leads the hours. Narrow, and it sits
       * only 45 minutes from 10:00 and the two labels collide — so drop it and
       * step the hours instead, keeping the spacing even.
       */
      tickIdx = width >= 700 ? [0, ...hours] : hours.filter((_, n) => n % 2 === 0)
    } else {
      const n = width < 560 ? 4 : 6
      tickIdx = Array.from({ length: n }, (_, i) => Math.round((i / (n - 1)) * (points.length - 1)))
    }

    return {
      coords,
      line,
      area,
      base,
      x,
      y,
      plotW,
      vTicks: axisTicks(vmin + pad * 0.4, vmax - pad * 0.4).map((v) => ({ v, y: y(v) })),
      tickIdx: [...new Set(tickIdx)],
    }
  }, [width, height, points, idx.prevClose, range])

  /*
   * The line strokes itself in whenever the range or the frame changes — but
   * not on every live tick, which would re-draw the session once a second.
   */
  useEffect(() => {
    if (!geo || !motionOK()) return
    const line = lineRef.current
    const len = line.getTotalLength()
    const tl = gsap.timeline()
    tl.fromTo(
      line,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', clearProps: 'strokeDasharray' },
    )
      .fromTo(areaRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.25)
      .fromTo(svgRef.current.querySelectorAll('[data-axis]'), { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.02 }, 0.1)
    /* revert, never kill — killing a `from` mid-flight strands it at opacity 0 */
    return () => tl.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, indexKey, width])

  /* crosshair rides the pointer on a quickTo so it never stutters */
  useEffect(() => {
    if (!cursorRef.current) return
    moveX.current = motionOK()
      ? gsap.quickTo(cursorRef.current, 'x', { duration: 0.15, ease: 'power2.out' })
      : (v) => gsap.set(cursorRef.current, { x: v })
  }, [geo])

  function handleMove(e) {
    if (!geo) return
    const rect = svgRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    /* nearest sample by x — coords are monotonic in time */
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < geo.coords.length; i++) {
      const d = Math.abs(geo.coords[i][0] - px)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    moveX.current?.(geo.coords[best][0])
    if (best !== hover) setHover(best)
  }

  const hovered = hover != null && geo ? points[hover] : null
  const hoveredPct = hovered ? ((hovered.v - idx.prevClose) / idx.prevClose) * 100 : 0

  /* tooltip flips to the left of the cursor once it nears the right gutter */
  const tipLeft = hovered && geo ? geo.coords[hover][0] : 0
  const flip = geo ? tipLeft > geo.plotW - 130 : false

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        ref={svgRef}
        width={width || undefined}
        height={height}
        viewBox={width ? `0 0 ${width} ${height}` : undefined}
        className="w-full block touch-pan-y"
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${idx.name} ${range} chart`}
      >
        {geo && (
          <>
            <defs>
              <linearGradient id={`fill-${indexKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.13" />
                <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* value axis — labels only, no grid; the page is already ruled */}
            {geo.vTicks.map((t) => (
              <text
                key={t.v}
                data-axis
                x={width - PAD.right + 14}
                y={t.y}
                dominantBaseline="middle"
                className="fill-[var(--ink-faint)] text-[11px] tabular-nums"
              >
                {fmtPrice(t.v).replace('.00', '')}
              </text>
            ))}

            {/* time axis */}
            {geo.tickIdx.map((i) => (
              <text
                key={i}
                data-axis
                x={geo.coords[i][0]}
                y={height - 8}
                textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                className="fill-[var(--ink-faint)] text-[11px] tabular-nums"
              >
                {fmtAxis(points[i].t, range)}
              </text>
            ))}

            {/* previous close — the line the whole session is judged against */}
            <line
              data-axis
              x1={PAD.left}
              x2={width - PAD.right}
              y1={geo.y(idx.prevClose)}
              y2={geo.y(idx.prevClose)}
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="5 5"
              opacity="0.55"
            />

            <path ref={areaRef} d={geo.area} fill={`url(#fill-${indexKey})`} />
            <path
              ref={lineRef}
              d={geo.line}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* live tip — only while the session is actually running */}
            {live && range === '1D' && (
              <circle
                cx={geo.coords.at(-1)[0]}
                cy={geo.coords.at(-1)[1]}
                r="4"
                fill="var(--ink)"
                className="pulse-dot"
              />
            )}

            {/* crosshair */}
            <g ref={cursorRef} style={{ opacity: hovered ? 1 : 0 }} className="transition-opacity duration-150">
              <line
                x1="0"
                x2="0"
                y1={PAD.top}
                y2={geo.base}
                stroke="var(--ink-faint)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <circle
                cx="0"
                cy={hovered ? geo.y(hovered.v) : 0}
                r="4.5"
                fill="var(--paper)"
                stroke="var(--ink)"
                strokeWidth="2"
              />
            </g>
          </>
        )}
      </svg>

      {/* readout */}
      {hovered && geo && (
        <div
          ref={tipRef}
          className="pointer-events-none absolute top-1 z-10 rounded-lg border border-rule bg-panel px-3 py-2 shadow-lg whitespace-nowrap"
          style={{ left: tipLeft, transform: `translateX(${flip ? '-100%' : '0'}) translateX(${flip ? -10 : 10}px)` }}
        >
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            {fmtStamp(hovered.t, range)}
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-serif font-semibold text-[15px] tabular-nums">
              {fmtPrice(hovered.v)}
            </span>
            <span
              className={`text-[11.5px] font-bold tabular-nums ${
                hoveredPct >= 0 ? 'text-up' : 'text-down'
              }`}
            >
              {fmtPct(hoveredPct)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
