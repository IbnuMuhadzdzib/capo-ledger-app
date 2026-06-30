import { useState, useRef, useCallback } from 'react'
import type { MonthSummary } from '../types/global'

interface YearlyChartProps {
  data: MonthSummary[]
  year: number
}

const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

interface TooltipState {
  visible: boolean
  x: number
  y: number
  svgX: number
  monthIndex: number
  income: number
  allocated: number
  remaining: number
  isPeak: boolean
}

export default function YearlyChart({ data, year }: YearlyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, svgX: 0, monthIndex: 0, income: 0, allocated: 0, remaining: 0, isPeak: false })

  // Chart dimensions
  const W = 1280
  const H = 140
  const PADDING = { top: 18, right: 20, bottom: 28, left: 62 }
  const chartW = W - PADDING.left - PADDING.right
  const chartH = H - PADDING.top - PADDING.bottom

  const maxIncome = Math.max(...data.map((d) => d.income), 1)
  const peakMonthIndex = data.reduce((pi, d, i) => (d.income > data[pi].income ? i : pi), 0)

  // Compute pixel coordinates for each month
  const pts = data.map((d, i) => ({
    x: PADDING.left + (i / 11) * chartW,
    y: PADDING.top + chartH - (d.income / maxIncome) * chartH,
    ...d
  }))

  // Smooth SVG path using cubic bezier
  const makePath = (points: typeof pts) => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return d
  }

  // Area path (closed at bottom)
  const makeAreaPath = (points: typeof pts) => {
    const linePath = makePath(points)
    if (!linePath) return ''
    const bottom = PADDING.top + chartH
    return `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`
  }

  const linePath = makePath(pts)
  const areaPath = makeAreaPath(pts)

  // Y-axis tick values
  const yTicks = 4
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxIncome / yTicks) * i)

  // Handle mouse move over SVG
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Find closest month
    const svgScaleX = W / rect.width
    const svgMouseX = mouseX * svgScaleX

    let closestIdx = 0
    let closestDist = Infinity
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - svgMouseX)
      if (dist < closestDist) { closestDist = dist; closestIdx = i }
    })

    const d = data[closestIdx]
    const isPeak = closestIdx === peakMonthIndex && d.income > 0

    setTooltip({
      visible: true,
      x: mouseX,
      y: mouseY,
      svgX: pts[closestIdx].x / svgScaleX,
      monthIndex: closestIdx,
      income: d.income,
      allocated: d.allocated,
      remaining: d.remaining,
      isPeak
    })
  }, [pts, data, peakMonthIndex])

  const handleMouseLeave = () => setTooltip((t) => ({ ...t, visible: false }))

  const allZero = data.every((d) => d.income === 0)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradient fill under income line */}
          <linearGradient id={`income-fill-${year}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a13b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#c9a13b" stopOpacity="0.01" />
          </linearGradient>
          {/* Crosshair gradient */}
          <linearGradient id="crosshair-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a13b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c9a13b" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTickValues.map((val, i) => {
          const gy = PADDING.top + chartH - (val / maxIncome) * chartH
          return (
            <g key={i}>
              <line
                x1={PADDING.left} y1={gy}
                x2={W - PADDING.right} y2={gy}
                stroke="rgba(201,161,59,0.1)" strokeWidth="1"
                strokeDasharray={i === 0 ? 'none' : '4 6'}
              />
              {/* Y-axis label */}
              <text
                x={PADDING.left - 6} y={gy + 4}
                textAnchor="end"
                fill="rgba(201,161,59,0.45)"
                fontSize="9"
                fontFamily="'Quincy', Georgia, serif"
              >
                {val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        {!allZero && (
          <path d={areaPath} fill={`url(#income-fill-${year})`} />
        )}

        {/* Income line */}
        {!allZero && (
          <path
            d={linePath}
            fill="none"
            stroke="#c9a13b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {pts.map((p, i) => {
          const isPeak = i === peakMonthIndex && p.income > 0
          return (
            <g key={i}>
              {/* All month dots */}
              {p.income > 0 && (
                <circle
                  cx={p.x} cy={p.y} r={isPeak ? 4 : 2.5}
                  fill={isPeak ? '#c9a13b' : '#0c0c0c'}
                  stroke={isPeak ? '#ffdd77' : '#c9a13b'}
                  strokeWidth={isPeak ? 2 : 1.5}
                />
              )}
            </g>
          )
        })}

        {/* Crosshair line when hovering */}
        {tooltip.visible && (
          <line
            x1={pts[tooltip.monthIndex]?.x ?? 0}
            y1={PADDING.top}
            x2={pts[tooltip.monthIndex]?.x ?? 0}
            y2={PADDING.top + chartH}
            stroke="url(#crosshair-grad)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        )}

        {/* Hover dot */}
        {tooltip.visible && (
          <circle
            cx={pts[tooltip.monthIndex]?.x ?? 0}
            cy={pts[tooltip.monthIndex]?.y ?? (PADDING.top + chartH)}
            r="5"
            fill="#c9a13b"
            stroke="#ffdd77"
            strokeWidth="2"
          />
        )}

        {/* X-axis labels */}
        {pts.map((p, i) => (
          <text
            key={i}
            x={p.x} y={H - 4}
            textAnchor="middle"
            fill={tooltip.visible && tooltip.monthIndex === i ? '#c9a13b' : 'rgba(201,161,59,0.45)'}
            fontSize="9"
            fontFamily="'Quincy', Georgia, serif"
            fontWeight={tooltip.visible && tooltip.monthIndex === i ? 'bold' : 'normal'}
          >
            {MONTHS_SHORT[i]}
          </text>
        ))}

        {/* Empty state */}
        {allZero && (
          <text
            x={W / 2} y={H / 2 + 4}
            textAnchor="middle"
            fill="rgba(201,161,59,0.3)"
            fontSize="13"
            fontFamily="'Special Elite', monospace"
            fontStyle="italic"
          >
            No income data recorded for {year}
          </text>
        )}
      </svg>

      {/* Tooltip — rendered in DOM, not SVG for better styling */}
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            transform: tooltip.monthIndex >= 9 ? 'translateX(calc(-100% - 14px))' : 'translateX(14px)',
            top: Math.max(4, tooltip.y - 60),
            pointerEvents: 'none',
            zIndex: 10,
            background: 'rgba(14,14,14,0.97)',
            border: `1px solid ${tooltip.isPeak ? '#ffdd77' : 'rgba(201,161,59,0.5)'}`,
            borderRadius: '4px',
            padding: '8px 12px',
            minWidth: '170px',
            boxShadow: `0 4px 20px rgba(0,0,0,0.8)${tooltip.isPeak ? ', 0 0 12px rgba(255,220,80,0.25)' : ''}`,
          }}
        >
          {/* Month + Peak badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--noir-gold)', textTransform: 'uppercase' }}>
              {MONTHS_FULL[tooltip.monthIndex]}
            </span>
            {tooltip.isPeak && (
              <span style={{ background: '#a07a22', color: '#fff8d8', fontSize: '8px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', padding: '1px 5px', borderRadius: '2px', textTransform: 'uppercase' }}>
                ★ PEAK
              </span>
            )}
          </div>
          {/* Income */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--noir-muted)' }}>Income</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--noir-green-bright)', fontWeight: 700 }}>
              {fmt(tooltip.income)}
            </span>
          </div>
          {/* Allocated */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--noir-muted)' }}>Allocated</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--noir-red-bright)' }}>
              − {fmt(tooltip.allocated)}
            </span>
          </div>
          {/* Divider + Remaining */}
          <div style={{ borderTop: '1px solid rgba(201,161,59,0.2)', marginTop: '4px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--noir-parchment)', fontWeight: 700 }}>Remaining</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: tooltip.remaining < 0 ? 'var(--noir-red-bright)' : 'var(--noir-parchment)' }}>
              {fmt(tooltip.remaining)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
