interface SummaryRibbonProps {
  totalPeriod: number
  totalAll: number
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)

export default function SummaryRibbon({ totalPeriod, totalAll }: SummaryRibbonProps) {
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
    </div>
  )
}
