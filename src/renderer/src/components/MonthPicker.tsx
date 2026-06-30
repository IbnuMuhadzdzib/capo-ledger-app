import { useState } from 'react'
import { MONTH_NAMES } from '../constants'

interface MonthPickerProps {
  currentMonth: number // 1-12
  currentYear: number
  onSelect: (month: number, year: number) => void
  onClose: () => void
}

export default function MonthPicker({
  currentMonth,
  currentYear,
  onSelect,
  onClose
}: MonthPickerProps) {
  const [year, setYear] = useState(currentYear)

  return (
    <div className="month-picker-overlay cursor-no-drag" onClick={onClose}>
      <div className="month-picker-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="month-picker-header">
          <button onClick={() => setYear((y) => y - 1)}>◀</button>
          <span className="month-picker-year">{year}</span>
          <button onClick={() => setYear((y) => y + 1)}>▶</button>
        </div>
        <div className="month-picker-grid">
          {MONTH_NAMES.map((monthName, idx) => {
            const m = idx + 1
            const isSelected = m === currentMonth && year === currentYear
            return (
              <button
                key={m}
                className={`month-picker-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(m, year)}
              >
                {monthName.substring(0, 3)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
