import { useState, useEffect } from 'react'
import { useIncomeStore } from '../store/useIncomeStore'
import { useAllocationStore } from '../store/useAllocationStore'
import type { MonthSummary } from '../types/global'
import YearlyChart from './YearlyChart'
import MostWanted from './MostWanted'
import Associates from './Associates'
import StakeoutCalendar from './StakeoutCalendar'

// Tab definition — extensible for future tabs
const TABS = [
  { id: 'annual',     label: 'ANNUAL LEDGER', icon: '✦' },
  { id: 'stakeout',  label: 'STAKEOUT',       icon: '👁' },
  { id: 'wanted',    label: 'MOST WANTED',    icon: '☠' },
  { id: 'associates',label: 'ASSOCIATES',     icon: '💼' }
]

export default function BottomPanel() {
  const { periodYear } = useIncomeStore()
  const incomeUpdateTrigger = useIncomeStore((state) => state.updateTrigger)
  const allocationUpdateTrigger = useAllocationStore((state) => state.updateTrigger)
  const [activeTab, setActiveTab] = useState('annual')
  const [chartYear, setChartYear] = useState(periodYear)
  const [data, setData] = useState<MonthSummary[]>([])
  const [loading, setLoading] = useState(false)

  // Sync chart year when passbook period year changes
  useEffect(() => {
    setChartYear(periodYear)
  }, [periodYear])

  // Fetch yearly data whenever chartYear changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    window.api.getYearlySummary(chartYear).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [chartYear, incomeUpdateTrigger, allocationUpdateTrigger])

  const totalYearIncome = data.reduce((s, d) => s + d.income, 0)
  const peakMonth = data.reduce((pi, d, i) => (d.income > data[pi].income ? i : pi), 0)
  const peakIncome = data[peakMonth]?.income ?? 0

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="bottom-panel cursor-no-drag">
      {/* ── Archive header with folder tabs ── */}
      <div className="bottom-panel-header">
        {/* Folder tabs */}
        <div className="bottom-panel-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`bottom-tab ${activeTab === tab.id ? 'bottom-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="bottom-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Year nav — right side (shared for both tabs) */}
        <div className="bottom-panel-year-nav">
          <button
            className="year-nav-btn"
            onClick={() => setChartYear((y) => y - 1)}
            title="Previous year"
          >
            ◂
          </button>
          <span className="year-nav-label">{chartYear}</span>
          <button
            className="year-nav-btn"
            onClick={() => setChartYear((y) => y + 1)}
            title="Next year"
          >
            ▸
          </button>
        </div>
      </div>

      {/* ── Panel body ── */}
      <div className="bottom-panel-body">
        {activeTab === 'annual' && (
          <div style={{ display: 'flex', height: '100%', gap: '0' }}>
            {/* Left: stats column */}
            <div className="bottom-stats-col">
              <div className="bottom-stat-block">
                <div className="bottom-stat-label">Total Income</div>
                <div className="bottom-stat-value" style={{ color: 'var(--noir-green-bright)' }}>
                  {loading ? '—' : fmt(totalYearIncome)}
                </div>
              </div>
              <div className="bottom-stat-block">
                <div className="bottom-stat-label">Peak Month</div>
                <div className="bottom-stat-value" style={{ color: 'var(--noir-gold)' }}>
                  {loading || peakIncome === 0 ? '—' : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][peakMonth]}
                </div>
                {!loading && peakIncome > 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--noir-muted)', marginTop: '2px' }}>
                    {fmt(peakIncome)}
                  </div>
                )}
              </div>
              <div className="bottom-stat-block">
                <div className="bottom-stat-label">Active Months</div>
                <div className="bottom-stat-value">
                  {loading ? '—' : `${data.filter((d) => d.income > 0).length} / 12`}
                </div>
              </div>
            </div>

            {/* Right: chart */}
            <div style={{ flex: 1, position: 'relative', minWidth: 0, paddingRight: '8px' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--noir-muted)', fontFamily: 'var(--font-body)', fontSize: '13px', fontStyle: 'italic', letterSpacing: '0.05em' }}>
                  Loading records...
                </div>
              ) : (
                <YearlyChart data={data} year={chartYear} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'wanted' && (
          <MostWanted year={chartYear} />
        )}

        {activeTab === 'associates' && (
          <Associates year={chartYear} />
        )}

        {activeTab === 'stakeout' && (
          <StakeoutCalendar
            year={chartYear}
            onDrillDown={(_month, _year) => {
              setChartYear(_year)
              setActiveTab('annual')
            }}
          />
        )}
      </div>

      {/* ── Archive document stamp decoration ── */}
      <div className="bottom-panel-stamp">
        <span>CAPO LEDGER</span>
        <span className="stamp-dot">◆</span>
        <span>FINANCIAL ARCHIVE</span>
        <span className="stamp-dot">◆</span>
        <span>CONFIDENTIAL</span>
      </div>
    </div>
  )
}
