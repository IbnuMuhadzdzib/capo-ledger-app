interface SummaryRibbonProps {
  totalPeriod: number
  totalAll: number
  grossProjectsByPeriod?: number
  grossAllTime?: number
}

const fmt = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)

export default function SummaryRibbon({ totalPeriod, totalAll, grossProjectsByPeriod, grossAllTime }: SummaryRibbonProps) {
  const hasSplitThisPeriod = (grossProjectsByPeriod ?? 0) > 0
  const hasSplitAllTime = (grossAllTime ?? 0) > 0

  return (
    <div className="summary-ribbon cursor-no-drag" style={{ flexDirection: 'column', gap: '8px', padding: '4px 0 8px' }}>

      {/* Row 1: Pure Income */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flexShrink: 0 }}>
          <p className="summary-label">My Share · This Month</p>
          <p className="summary-value">{fmt(totalPeriod)}</p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <p className="summary-label">My Share · All Time</p>
          <p className="summary-value" style={{ opacity: 0.8 }}>{fmt(totalAll)}</p>
        </div>
      </div>

      {/* Row 2: Gross breakdown — only when there are split projects */}
      {(hasSplitThisPeriod || hasSplitAllTime) && (
        <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid rgba(201,161,59,0.12)', paddingTop: '6px' }}>
          {hasSplitThisPeriod && (
            <div style={{ flexShrink: 0 }}>
              <p className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📋</span> Gross This Month
              </p>
              <p className="summary-value" style={{ fontSize: '13px', color: 'var(--noir-muted)' }}>{fmt(grossProjectsByPeriod!)}</p>
            </div>
          )}
          {hasSplitAllTime && (
            <div style={{ flexShrink: 0 }}>
              <p className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📋</span> Gross All Time
              </p>
              <p className="summary-value" style={{ fontSize: '13px', color: 'var(--noir-muted)' }}>{fmt(grossAllTime!)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
