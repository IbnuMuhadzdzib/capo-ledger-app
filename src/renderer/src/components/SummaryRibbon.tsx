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
    <div className="summary-ribbon cursor-no-drag">
      <div>
        <p className="summary-label">This month</p>
        <p className="summary-value">{formatRupiah(totalPeriod)}</p>
      </div>
      <div>
        <p className="summary-label">All time</p>
        <p className="summary-value">{formatRupiah(totalAll)}</p>
      </div>

      {grossProjectsByPeriod !== undefined && grossProjectsByPeriod > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderLeft: '1px solid rgba(201,161,59,0.2)',
          paddingLeft: '12px',
          marginLeft: '12px',
          width: '100%',
        }}>
          <p className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📋</span> Team projects gross
          </p>
          <p className="summary-value" style={{ fontSize: '13px' }}>{formatRupiah(grossProjectsByPeriod)}</p>
        </div>
      )}
    </div>
  )
}
