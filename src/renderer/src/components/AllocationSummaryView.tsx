import { useState, useEffect } from 'react'
import type { AllocationRecord } from '../types/income'

interface AllocationSummaryViewProps {
  allocations: AllocationRecord[]
  totalIncome: number
  onEdit: (a: AllocationRecord) => void
  onDelete: (id: string) => void
}

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

export default function AllocationSummaryView({ allocations, totalIncome, onEdit, onDelete }: AllocationSummaryViewProps) {
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationRecord | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4
  
  useEffect(() => {
    setCurrentPage(1)
  }, [allocations])

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0)
  const remaining = totalIncome - totalAllocated
  const isNegative = remaining < 0

  const totalPages = Math.ceil(allocations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentAllocations = allocations.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col h-full relative cursor-no-drag">
      {/* ── Summary Header ───────────────────────────── */}
      <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(201,161,59,0.25)' }}>
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--noir-muted)' }}>Total Income</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--noir-gold)', fontSize: '13px' }}>{fmt(totalIncome)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--noir-muted)' }}>Allocated</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--noir-red-bright)', fontSize: '13px' }}>− {fmt(totalAllocated)}</span>
        </div>
        <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px dashed rgba(201,161,59,0.2)' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase', color: isNegative ? 'var(--noir-red-bright)' : 'var(--noir-parchment)', fontWeight: 700 }}>Remaining</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: isNegative ? 'var(--noir-red-bright)' : 'var(--noir-green-bright)' }}>
            {fmt(remaining)}
          </span>
        </div>
      </div>

      {/* ── Column Headers ───────────────────────────── */}
      <div className="flex justify-between mb-2 pl-3 pr-3" style={{ borderBottom: '1px solid rgba(201,161,59,0.15)', paddingBottom: '8px' }}>
        <div style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--noir-gold)' }}>Description</div>
        <div style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--noir-gold)' }}>Amount</div>
      </div>

      {/* ── List ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden" style={{ maxHeight: '100%' }}>
        {allocations.length === 0 ? (
          <p style={{ color: 'var(--noir-muted)', textAlign: 'center', marginTop: '24px', fontSize: '13px', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
            No allocations for this month.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {currentAllocations.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center px-3 py-3 rounded cursor-pointer transition-all group"
                style={{ borderBottom: '1px solid rgba(201,161,59,0.06)' }}
                onClick={() => setSelectedAllocation(a)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,161,59,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontWeight: 600, color: 'var(--noir-parchment)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>{a.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--noir-red-bright)', fontSize: '12px' }}>
                  − {fmt(a.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* ── Detail Modal ─────────────────────────────── */}
      {selectedAllocation && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-no-drag"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelectedAllocation(null)}
          ></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 rounded z-50 w-64 flex flex-col gap-3 cursor-no-drag"
            style={{ background: 'var(--noir-card)', border: '1px solid var(--noir-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.95)' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--noir-gold)', fontSize: '14px', letterSpacing: '0.1em', borderBottom: '1px solid rgba(201,161,59,0.25)', paddingBottom: '10px', margin: '0 0 4px' }}>
              ALLOCATION DETAILS
            </h4>
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--noir-muted)', marginBottom: '3px' }}>Label</div>
              <div style={{ color: 'var(--noir-parchment)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>{selectedAllocation.label}</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--noir-muted)', marginBottom: '3px' }}>Amount</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--noir-red-bright)', fontSize: '15px', fontWeight: 700 }}>− {fmt(selectedAllocation.amount)}</div>
            </div>
            <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid rgba(201,161,59,0.2)' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px' }}
                onClick={() => { onEdit(selectedAllocation); setSelectedAllocation(null) }}
              >
                ✎ Edit
              </button>
              <button
                style={{ background: 'rgba(139,32,32,0.2)', color: 'var(--noir-red-bright)', border: '1px solid rgba(139,32,32,0.4)', borderRadius: '4px', fontSize: '11px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                onClick={() => { onDelete(selectedAllocation.id); setSelectedAllocation(null) }}
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
