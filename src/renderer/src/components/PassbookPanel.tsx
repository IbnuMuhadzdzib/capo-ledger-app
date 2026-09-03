import { useState } from 'react'
import { useIncomeStore } from '../store/useIncomeStore'
import { useTellerStore } from '../store/useTellerStore'
import { MONTH_NAMES } from '../constants'
import SummaryRibbon from './SummaryRibbon'
import SettingsMenu from './SettingsMenu'
import MonthPicker from './MonthPicker'
import { useAppStore } from '../store/useAppStore'

export default function PassbookPanel() {
  const {
    periodMonth,
    periodYear,
    totalPeriod,
    totalAll,
    grossProjectsByPeriod,
    grossAllTime,
    goToPreviousPeriod,
    goToNextPeriod
  } = useIncomeStore()
  const say = useTellerStore((s) => s.say)

  const { activeTab, setActiveTab } = useAppStore()
  const [showPicker, setShowPicker] = useState(false)

  const handlePrev = () => {
    goToPreviousPeriod()
    say('periodChanged')
  }

  const handleNext = () => {
    goToNextPeriod()
    say('periodChanged')
  }

  const handleAddIncome = () => {
    useAppStore.getState().openForm('income')
    say('addIncome')
  }

  const handleAddAllocation = () => {
    useAppStore.getState().openForm('allocation')
    say('addIncome')
  }

  return (
    <div className="passbook-panel">
      {/* ── Noir drag header ─────────────────────────────── */}
      <div
        className="passbook-drag-header"
        title="Drag to move"
      >
        <span className="passbook-header-title">CAPO LEDGER</span>
        <div className="app-titlebar-actions">

          <SettingsMenu />
          <button
            className="window-btn cursor-no-drag"
            onClick={() => window.api.minimizeWindow()}
            aria-label="Minimize"
          >
            —
          </button>
          <button
            className="window-btn window-btn-close cursor-no-drag"
            onClick={() => window.api.closeWindow()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="passbook-page">
        {/* ── Period Navigation ──────────────────────────── */}
        <div className="period-nav">
          <button className="period-nav-btn cursor-no-drag" onClick={handlePrev} aria-label="Bulan sebelumnya">
            ◂
          </button>

          <div style={{ position: 'relative', textAlign: 'center' }}>
            <button
              className="passbook-period cursor-no-drag"
              onClick={() => setShowPicker(true)}
            >
              {MONTH_NAMES[periodMonth - 1]} {periodYear}
              <span className="period-caret">▾</span>
            </button>

            {showPicker && (
              <MonthPicker
                currentMonth={periodMonth}
                currentYear={periodYear}
                onClose={() => setShowPicker(false)}
                onSelect={(m, y) => {
                  useIncomeStore.getState().setPeriod(m, y)
                  say('periodChanged')
                  setShowPicker(false)
                }}
              />
            )}
          </div>

          <button className="period-nav-btn cursor-no-drag" onClick={handleNext} aria-label="Bulan berikutnya">
            ▸
          </button>
        </div>

        {/* ── Summary Card ──────────────────────────────── */}
        <div className="passbook-card">
          <span className="passbook-card-label">Summary</span>
          <SummaryRibbon totalPeriod={totalPeriod} totalAll={totalAll} grossProjectsByPeriod={grossProjectsByPeriod} grossAllTime={grossAllTime} />
        </div>

        {/* ── Tab + Action Button ───────────────────────── */}
        <div className="passbook-tabs cursor-no-drag">
          <button
            className={`passbook-tab ${activeTab === 'daftar' ? 'passbook-tab-active' : ''}`}
            onClick={() => setActiveTab('daftar')}
          >
            Income
          </button>
          <button
            className={`passbook-tab ${activeTab === 'alokasi' ? 'passbook-tab-active' : ''}`}
            onClick={() => setActiveTab('alokasi')}
          >
            Allocation
          </button>
        </div>

        {activeTab === 'daftar' ? (
          <button className="btn-primary w-full mt-2 cursor-no-drag" onClick={handleAddIncome}>
            + Add Income
          </button>
        ) : (
          <button className="btn-primary w-full mt-2 cursor-no-drag" onClick={handleAddAllocation}>
            + Add Allocation
          </button>
        )}
      </div>
    </div>
  )
}
