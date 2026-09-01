import { useState, useEffect, type FormEvent } from 'react'
import { useAllocationStore } from '../store/useAllocationStore'
import { useIncomeStore } from '../store/useIncomeStore'
import { useAppStore } from '../store/useAppStore'
import CurrencyInput from './CurrencyInput'

const now = new Date()

export default function AllocationForm() {
  const { addAllocation, updateAllocation } = useAllocationStore()
  const { periodMonth, periodYear } = useIncomeStore()
  const { editingAllocation, closeForm, openForms } = useAppStore()
  const allocation = editingAllocation
  const isEdit = !!allocation

  const [label, setLabel] = useState(allocation?.label ?? '')
  const [amount, setAmount] = useState(allocation?.amount ?? 0)

  useEffect(() => {
    if (openForms.includes('allocation')) {
      setLabel(allocation?.label ?? '')
      setAmount(allocation?.amount ?? 0)
    }
  }, [openForms.includes('allocation'), allocation?.id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (amount <= 0 || !label.trim()) return

    const input = {
      periodMonth: allocation?.periodMonth ?? periodMonth ?? now.getMonth() + 1,
      periodYear: allocation?.periodYear ?? periodYear ?? now.getFullYear(),
      label: label.trim(),
      amount
    }

    if (isEdit && allocation) {
      await updateAllocation(allocation.id, input)
    } else {
      await addAllocation(input)
    }
    closeForm('allocation')
  }

  const allocations = useAllocationStore((s) => s.allocations)
  const totalPeriod = useIncomeStore((s) => s.totalPeriod)

  const previousAmount = isEdit && allocation ? allocation.amount : 0
  const currentRemaining = totalPeriod - (allocations.reduce((sum, a) => sum + a.amount, 0) - previousAmount)
  const finalRemaining = currentRemaining - amount

  const fmtIDR = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v).replace('Rp', 'Rp ')

  return (
    <form className="side-module-card cursor-no-drag" onSubmit={handleSubmit} style={{ gap: 0 }}>
      <h3 className="font-serif text-lg mb-4" style={{ borderBottom: '1px solid rgba(201,161,59,0.3)', paddingBottom: '10px', margin: '0', fontFamily: 'var(--font-display)', color: 'var(--noir-gold)', letterSpacing: '0.06em', flexShrink: 0 }}>
        {isEdit ? 'Edit Allocation' : 'Add Allocation'}
      </h3>

      {/* Content area — no scroll, fits within card */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 0' }}>
        <input
          type="text"
          placeholder="Label (e.g. Savings, Rent)"
          className="form-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />

        <div>
          <CurrencyInput
            value={amount}
            onValueChange={setAmount}
            placeholder="Amount"
            required
          />
          {amount > 0 && (
            <div style={{ fontSize: '11px', color: finalRemaining < 0 ? 'rgba(220, 53, 69, 0.9)' : 'var(--noir-gold)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={finalRemaining < 0 ? "animate-pulse" : ""}
              >
                <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              Balance after allocation: {finalRemaining < 0 ? '-' : ''}{fmtIDR(Math.abs(finalRemaining))}
            </div>
          )}
        </div>
      </div>

      {/* Pinned footer — never overflows */}
      <div style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'stretch', paddingTop: '14px', borderTop: '1px solid rgba(201,161,59,0.2)' }}>
        <button type="button" className="btn-secondary" onClick={() => closeForm('allocation')}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={amount <= 0 || !label.trim()}>
          Save
        </button>
      </div>
    </form>
  )
}
