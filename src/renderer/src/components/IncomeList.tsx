import { useState, useEffect } from 'react'
import type { IncomeRecord } from '../types/income'

interface IncomeListProps {
  incomes: IncomeRecord[]
  onEdit: (income: IncomeRecord) => void
  onDelete: (id: string) => void
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)

export default function IncomeList({ incomes, onEdit, onDelete }: IncomeListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null)
  const itemsPerPage = 4

  useEffect(() => {
    setCurrentPage(1)
  }, [incomes])

  if (incomes.length === 0) {
    return (
      <p style={{ color: 'var(--noir-muted)', textAlign: 'center', marginTop: '24px', fontSize: '13px', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
        No income recorded this period.
      </p>
    )
  }

  const totalPages = Math.ceil(incomes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentIncomes = incomes.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div style={{ marginTop: '4px', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Column headers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid rgba(201,161,59,0.2)', marginBottom: '4px' }}>
        <span style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--noir-gold)' }}>Source</span>
        <span style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--noir-gold)' }}>Amount</span>
      </div>

      {/* List rows */}
      <div className="flex flex-col gap-0">
        {currentIncomes.map((income) => (
          <div
            key={income.id}
            onClick={() => setSelectedIncome(income)}
            className="flex justify-between items-center cursor-pointer transition-all"
            style={{ padding: '10px 12px', borderBottom: '1px solid rgba(201,161,59,0.06)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,161,59,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div>
              <div style={{ fontWeight: 600, color: 'var(--noir-parchment)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
                {income.source || 'Tanpa sumber'}
              </div>
              {income.note && (
                <div style={{ fontSize: '11px', color: 'var(--noir-muted)', fontStyle: 'italic', marginTop: '2px' }}>{income.note}</div>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--noir-green-bright)', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginLeft: '12px' }}>
              {formatRupiah(income.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '12px' }}>
          <button
            className="cursor-no-drag"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              opacity: currentPage === 1 ? 0.4 : 1,
              background: 'rgba(201,161,59,0.08)',
              border: '1px solid rgba(201,161,59,0.3)',
              color: 'var(--noir-parchment)',
              padding: '4px 12px',
              borderRadius: '3px',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              letterSpacing: '0.06em'
            }}
          >
            ◂ PREV
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--noir-muted)', fontSize: '11px' }}>{currentPage} / {totalPages}</span>
          <button
            className="cursor-no-drag"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              opacity: currentPage === totalPages ? 0.4 : 1,
              background: 'rgba(201,161,59,0.08)',
              border: '1px solid rgba(201,161,59,0.3)',
              color: 'var(--noir-parchment)',
              padding: '4px 12px',
              borderRadius: '3px',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              letterSpacing: '0.06em'
            }}
          >
            NEXT ▸
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIncome && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-no-drag"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelectedIncome(null)}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 rounded z-50 w-64 flex flex-col gap-3 cursor-no-drag"
            style={{ background: 'var(--noir-card)', border: '1px solid var(--noir-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.95)' }}
          >
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--noir-gold)', fontSize: '14px', letterSpacing: '0.1em', borderBottom: '1px solid rgba(201,161,59,0.25)', paddingBottom: '10px', margin: '0 0 4px' }}>
              INCOME DETAILS
            </h4>
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--noir-muted)', marginBottom: '3px' }}>Source</div>
              <div style={{ color: 'var(--noir-parchment)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>{selectedIncome.source || 'Tanpa sumber'}</div>
            </div>
            {selectedIncome.note && (
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--noir-muted)', marginBottom: '3px' }}>Note</div>
                <div style={{ color: 'var(--noir-muted)', fontFamily: 'var(--font-body)', fontSize: '13px', fontStyle: 'italic' }}>{selectedIncome.note}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--noir-muted)', marginBottom: '3px' }}>Amount</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--noir-green-bright)', fontSize: '16px', fontWeight: 700 }}>{formatRupiah(selectedIncome.amount)}</div>
            </div>

            <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid rgba(201,161,59,0.2)' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px' }}
                onClick={() => { onEdit(selectedIncome); setSelectedIncome(null) }}
              >
                ✎ Edit
              </button>
              <button
                style={{ background: 'rgba(139,32,32,0.2)', color: 'var(--noir-red-bright)', border: '1px solid rgba(139,32,32,0.4)', borderRadius: '4px', fontSize: '11px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                onClick={() => { onDelete(selectedIncome.id); setSelectedIncome(null) }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
