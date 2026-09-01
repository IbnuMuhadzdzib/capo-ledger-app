import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react'
import type { DailyActivity } from '../types/global'
import { useIncomeStore } from '../store/useIncomeStore'
import { useAllocationStore } from '../store/useAllocationStore'
import { getDailyActivity } from '../lib/chartQueries'

interface StakeoutCalendarProps {
  year: number
  onDrillDown?: (month: number, year: number) => void
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Fixed vertical sizing
const CELL_H = 13
const GAP_V = 3
const STEP_V = CELL_H + GAP_V  // 16 — total row height
const GRID_H = 7 * STEP_V      // 112px
const DAY_LBL = 26              // px reserved for day-of-week labels

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(n).replace('Rp', 'Rp')

const fmtDay = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDayStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCellColor(count: number): string {
  if (count === 0) return 'rgba(201,161,59,0.06)'
  if (count === 1) return 'rgba(201,161,59,0.28)'
  if (count <= 3) return 'rgba(201,161,59,0.55)'
  if (count <= 6) return 'rgba(201,161,59,0.78)'
  return 'rgba(201,161,59,1.00)'
}

export default function StakeoutCalendar({ year, onDrillDown }: StakeoutCalendarProps) {
  const [rawData, setRawData] = useState<DailyActivity[]>([])
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const [availW, setAvailW] = useState(900)
  const containerRef = useRef<HTMLDivElement>(null)
  const gridAreaRef = useRef<HTMLDivElement>(null)

  const incomeUpd = useIncomeStore((s) => s.updateTrigger)
  const allocUpd = useAllocationStore((s) => s.updateTrigger)

  // Measure grid area width dynamically
  useLayoutEffect(() => {
    const el = gridAreaRef.current
    if (!el) return
    const update = () => setAvailW(el.clientWidth)
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    getDailyActivity(year).then((data: DailyActivity[]) => {
      if (!cancelled) setRawData(data)
    })
    return () => { cancelled = true }
  }, [year, incomeUpd, allocUpd])

  const countMap = useMemo(() => {
    const m = new Map<string, number>()
    rawData.forEach(({ day, count }) => m.set(day, count))
    return m
  }, [rawData])

  const totalMap = useMemo(() => {
    const m = new Map<string, number>()
    rawData.forEach(({ day, total }) => m.set(day, total))
    return m
  }, [rawData])

  // Sidebar metrics
  const metrics = useMemo(() => {
    const daysInYear = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365
    const activeDays = rawData.length

    let busiestDay = ''
    let busiestCount = 0
    rawData.forEach(({ day, count }) => {
      if (count > busiestCount) { busiestCount = count; busiestDay = day }
    })

    let longestSilence = 0
    let currentSilence = 0
    const cur = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    while (cur <= end) {
      const ds = formatDayStr(cur)
      if (!countMap.has(ds)) { currentSilence++; if (currentSilence > longestSilence) longestSilence = currentSilence }
      else currentSilence = 0
      cur.setDate(cur.getDate() + 1)
    }

    const today = new Date()
    let monitoredDays: number
    if (today.getFullYear() === year) monitoredDays = Math.floor((today.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1
    else if (year < today.getFullYear()) monitoredDays = daysInYear
    else monitoredDays = 0

    const busiestLabel = busiestDay
      ? new Date(busiestDay + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : '—'

    return { activeDays, daysInYear, busiestLabel, busiestCount, longestSilence, monitoredDays }
  }, [rawData, countMap, year])

  // Build grid
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)
  const startOffset = startDate.getDay()
  const allDays: (Date | null)[] = Array(startOffset).fill(null)
  const cur2 = new Date(startDate)
  while (cur2 <= endDate) { allDays.push(new Date(cur2)); cur2.setDate(cur2.getDate() + 1) }
  while (allDays.length % 7 !== 0) allDays.push(null)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < allDays.length; i += 7) weeks.push(allDays.slice(i, i + 7))

  const numWeeks = weeks.length
  const cellAreaW = availW - DAY_LBL
  const STEP_H = cellAreaW / numWeeks              // dynamic horizontal step
  const CELL_W = Math.max(STEP_H - 2, 3)          // cell width = step minus 2px gap

  const monthCols: { label: string; col: number }[] = []
  weeks.forEach((week, wi) => {
    week.forEach((d) => {
      if (d && d.getDate() === 1) monthCols.push({ label: MONTHS_SHORT[d.getMonth()], col: wi })
    })
  })

  const today = new Date()

  return (
    <div ref={containerRef} className="stakeout-container" onMouseLeave={() => setTooltip(null)}>

      {/* ── LEFT SIDEBAR ── */}
      <div className="stakeout-sidebar">
        <div className="stakeout-metric">
          <span className="sk-label">BUSIEST DAY</span>
          <span className="sk-value">{metrics.busiestLabel}</span>
          <span className="sk-sub">{metrics.busiestCount > 0 ? `${metrics.busiestCount} transactions` : 'no data yet'}</span>
        </div>
        <div className="stakeout-metric">
          <span className="sk-label">ACTIVE DAYS</span>
          <span className="sk-value">
            {metrics.activeDays}
            <span className="sk-denom">/{metrics.daysInYear}</span>
          </span>
          <span className="sk-sub">
            {metrics.daysInYear > 0 ? `${((metrics.activeDays / metrics.daysInYear) * 100).toFixed(0)}% coverage` : '—'}
          </span>
        </div>
        <div className="stakeout-metric">
          <span className="sk-label">LONGEST SILENCE</span>
          <span className="sk-value">
            {metrics.longestSilence}
            <span className="sk-denom"> days</span>
          </span>
          <span className="sk-sub">dark period</span>
        </div>
      </div>

      {/* ── SEPARATOR ── */}
      <div className="stakeout-divider" />

      {/* ── HEATMAP GRID AREA ── */}
      <div ref={gridAreaRef} className="stakeout-grid-area">

        {/* Month labels row */}
        <svg width={availW} height={14} style={{ display: 'block', overflow: 'visible' }}>
          <g transform={`translate(${DAY_LBL}, 0)`}>
            {monthCols.map(({ label, col }) => (
              <text key={label} x={col * STEP_H} y={11} className="heatmap-month-label">{label}</text>
            ))}
          </g>
        </svg>

        {/* Day labels + cell grid */}
        <svg width={availW} height={GRID_H} style={{ display: 'block', overflow: 'visible' }}>
          {/* Day-of-week labels */}
          {[1, 3, 5].map((di) => (
            <text key={di} x={DAY_LBL - 4} y={di * STEP_V + CELL_H} textAnchor="end" className="heatmap-day-label">
              {DAYS_SHORT[di].slice(0, 3)}
            </text>
          ))}

          {/* Cells */}
          <g transform={`translate(${DAY_LBL}, 0)`}>
            {weeks.map((week, wi) =>
              week.map((d, di) => {
                if (!d) return null
                const ds = formatDayStr(d)
                const count = countMap.get(ds) ?? 0
                const amount = totalMap.get(ds) ?? 0
                const isToday = today.toDateString() === d.toDateString()
                const isFuture = d > today && d.getFullYear() === today.getFullYear()
                const cx = wi * STEP_H
                const cy = di * STEP_V

                return (
                  <rect
                    key={ds}
                    x={cx}
                    y={cy}
                    width={CELL_W}
                    height={CELL_H}
                    rx={1.5}
                    fill={isFuture ? 'rgba(201,161,59,0.02)' : getCellColor(count)}
                    stroke={isToday ? '#c9a13b' : 'none'}
                    strokeWidth={isToday ? 1 : 0}
                    opacity={isFuture ? 0.35 : 1}
                    style={{ cursor: count > 0 ? 'pointer' : 'default' }}
                    onMouseEnter={(e) => {
                      if (isFuture) return
                      const cr = containerRef.current?.getBoundingClientRect()
                      const sr = (e.target as SVGElement).closest('svg')?.getBoundingClientRect()
                      if (!cr || !sr) return
                      const relX = sr.left - cr.left + DAY_LBL + cx + CELL_W / 2
                      const relY = sr.top - cr.top + cy - 4
                      const base = count === 0 ? 'no activity' : `${count} transaction${count > 1 ? 's' : ''}`
                      const extra = count > 0 ? ` · ${fmtCurrency(amount)}` : ''
                      setTooltip({ text: `${fmtDay(d)} — ${base}${extra}`, x: relX, y: relY })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (!isFuture && count > 0 && onDrillDown) onDrillDown(d.getMonth() + 1, d.getFullYear())
                    }}
                  />
                )
              })
            )}
          </g>
        </svg>

        {/* Footer row: micro-copy left, legend right — aligned to full grid width */}
        <div className="stakeout-footer-row" style={{ width: availW }}>
          <span className="stakeout-micro-copy">
            UNDER OBSERVATION SINCE JAN {year} · {metrics.monitoredDays} DAYS MONITORED
          </span>
          <div className="stakeout-legend">
            <span className="legend-label">Less</span>
            {[0, 1, 2, 4, 7].map((c) => (
              <svg key={c} width={CELL_H} height={CELL_H} style={{ display: 'block', flexShrink: 0 }}>
                <rect width={CELL_H} height={CELL_H} rx={1.5} fill={getCellColor(c)} />
              </svg>
            ))}
            <span className="legend-label">More</span>
            <span className="legend-basis">· by # transactions</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
