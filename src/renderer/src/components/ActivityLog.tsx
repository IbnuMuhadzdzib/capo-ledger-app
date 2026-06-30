import { useMemo, useState, useEffect } from 'react'
import { useIncomeStore } from '../store/useIncomeStore'
import { useAllocationStore } from '../store/useAllocationStore'
import { MONTH_NAMES_SHORT } from '../constants'

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(n).replace('Rp', 'Rp')

const fmtDate = (isoStr: string) => {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

interface ActivityLogProps {
  isCompact: boolean
}

export default function ActivityLog({ isCompact }: ActivityLogProps) {
  const { incomes, periodMonth, periodYear } = useIncomeStore()
  const { allocations } = useAllocationStore()
  const [page, setPage] = useState(0)

  const itemsPerPage = isCompact ? 3 : 9

  const combined = useMemo(() => {
    const arr = [
      ...incomes.map((i) => ({ ...i, type: 'income' as const })),
      ...allocations.map((a) => ({ ...a, type: 'allocation' as const }))
    ]
    arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return arr
  }, [incomes, allocations])

  const totalPages = Math.max(1, Math.ceil(combined.length / itemsPerPage))

  // Ensure page is valid if itemsPerPage or combined.length changes
  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1))
    }
  }, [totalPages, page])

  const paginatedItems = combined.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  return (
    <div className={`activity-log-card ${isCompact ? 'compact' : ''}`}>
      <div className="activity-log-header">
        <h3 className="activity-log-title">Activity Log</h3>
        <span className="activity-log-period">
          {MONTH_NAMES_SHORT[periodMonth - 1]} {periodYear}
        </span>
      </div>

      <div className="activity-log-body">
        {combined.length === 0 ? (
          <div className="activity-log-empty">No activity recorded this period</div>
        ) : (
          paginatedItems.map((item) => (
            <div key={item.id} className="activity-row">
              <div className={`activity-icon ${item.type}`}>
                {item.type === 'income' ? '↙' : '↗'}
              </div>
              <div className="activity-details">
                <span className="activity-label">
                  {item.type === 'income' ? item.source : item.label}
                </span>
                <span className="activity-date">{fmtDate(item.createdAt)}</span>
              </div>
              <div className={`activity-amount ${item.type}`}>
                {item.type === 'income' ? '+' : '-'} {fmtCurrency(item.amount)}
              </div>
            </div>
          ))
        )}
      </div>

      {combined.length > itemsPerPage && (
        <div className="activity-log-pagination">
          <button 
            className="page-btn cursor-no-drag" 
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ◂
          </button>
          <span className="page-info">
            PAGE {page + 1} / {totalPages}
          </span>
          <button 
            className="page-btn cursor-no-drag" 
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            ▸
          </button>
        </div>
      )}
    </div>
  )
}
