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

  return (
    <form className="side-module-card cursor-no-drag" onSubmit={handleSubmit}>
      <h3 className="font-serif text-lg mb-4" style={{ borderBottom: '1px solid rgba(201,161,59,0.3)', paddingBottom: '10px', margin: '0 0 16px 0', fontFamily: 'var(--font-display)', color: 'var(--noir-gold)', letterSpacing: '0.06em' }}>
        {isEdit ? 'Edit Allocation' : 'Add Allocation'}
      </h3>

      <input
        type="text"
        placeholder="Label (e.g. Savings, Rent)"
        className="form-input mb-3"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
      />

      <CurrencyInput
        value={amount}
        onValueChange={setAmount}
        placeholder="Amount"
        className="mb-3"
        required
      />

      <div className="flex justify-end gap-2 mt-auto pt-4" style={{ borderTop: '1px solid rgba(201,161,59,0.2)' }}>
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
