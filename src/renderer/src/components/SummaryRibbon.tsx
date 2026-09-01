interface SummaryRibbonProps {
  totalPeriod: number
  totalAll: number
  grossProjectsByPeriod?: number
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)

export default function SummaryRibbon({ totalPeriod, totalAll, grossProjectsByPeriod }: SummaryRibbonProps) {
  return (
    <div className="summary-ribbon cursor-no-drag" style={{ gap: '24px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto', paddingRight: '8px' }}>
      <div style={{ flexShrink: 0 }}>
        <p className="summary-label">This month</p>
        <p className="summary-value">{formatRupiah(totalPeriod)}</p>
      </div>
      <div style={{ flexShrink: 0 }}>
        <p className="summary-label">All time</p>
        <p className="summary-value" style={{ opacity: 0.8 }}>{formatRupiah(totalAll)}</p>
      </div>

      {grossProjectsByPeriod !== undefined && grossProjectsByPeriod > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderLeft: '1px solid rgba(201,161,59,0.2)',
          paddingLeft: '16px',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          <p className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📋</span> Team projects gross
          </p>
          <p className="summary-value" style={{ fontSize: '13px', color: 'var(--noir-parchment)' }}>{formatRupiah(grossProjectsByPeriod)}</p>
        </div>
      )}
    </div>
  )
}
