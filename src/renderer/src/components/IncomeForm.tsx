import { useState, useEffect, type FormEvent } from 'react'
import { useIncomeStore } from '../store/useIncomeStore'
import { useAppStore } from '../store/useAppStore'
import CurrencyInput from './CurrencyInput'

const now = new Date()

export default function IncomeForm() {
  const { addIncome, updateIncome, periodMonth, periodYear } = useIncomeStore()
  const { editingIncome, closeForm, openForms } = useAppStore()
  const income = editingIncome
  const isEdit = !!income

  const [amount, setAmount] = useState(0)
  const [source, setSource] = useState('')
  const [note, setNote] = useState('')

  // Reset form state whenever the form is opened or editingIncome changes
  useEffect(() => {
    if (openForms.includes('income')) {
      setAmount(income?.amount ?? 0)
      setSource(income?.source ?? '')
      setNote(income?.note ?? '')
    }
  }, [openForms.includes('income'), income?.id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (amount <= 0) return

    const input = {
      periodMonth: income?.periodMonth ?? periodMonth ?? now.getMonth() + 1,
      periodYear: income?.periodYear ?? periodYear ?? now.getFullYear(),
      amount,
      source,
      note
    }

    if (isEdit && income) {
      await updateIncome(income.id, input)
    } else {
      await addIncome(input)
    }
    closeForm('income')
  }

  return (
    <form className="side-module-card cursor-no-drag" onSubmit={handleSubmit}>
      <h3 className="font-serif text-lg mb-4" style={{ borderBottom: '1px solid rgba(201,161,59,0.3)', paddingBottom: '10px', margin: '0 0 16px 0', fontFamily: 'var(--font-display)', color: 'var(--noir-gold)', letterSpacing: '0.06em' }}>
        {isEdit ? 'Edit Income' : 'Add Income'}
      </h3>

      <input
        type="text"
        placeholder="Source (e.g. Salary, Freelance)"
        className="form-input mb-3"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <CurrencyInput
        value={amount}
        onValueChange={setAmount}
        placeholder="Amount"
        className="mb-3"
        required
      />
      <input
        type="text"
        placeholder="Notes (optional)"
        className="form-input mb-3"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

        <div className="flex justify-end gap-2 mt-auto pt-4" style={{ borderTop: '1px solid rgba(201,161,59,0.2)' }}>
          <button type="button" className="btn-secondary" onClick={() => closeForm('income')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={amount <= 0}>
            Save
          </button>
        </div>
    </form>
  )
}
