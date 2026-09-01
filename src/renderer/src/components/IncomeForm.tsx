import { useState, useEffect, type FormEvent } from 'react'
import { Users, ArrowRight } from 'lucide-react'
import { useIncomeStore } from '../store/useIncomeStore'
import { useAppStore } from '../store/useAppStore'
import CurrencyInput from './CurrencyInput'

const now = new Date()
const fmtIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

export default function IncomeForm() {
  const { addIncome, updateIncome, periodMonth, periodYear } = useIncomeStore()
  const { editingIncome, closeForm, openForms, setIsSplitActive } = useAppStore()
  const income = editingIncome
  const isEdit = !!income

  const [amount, setAmount] = useState(0)
  const [source, setSource] = useState('')
  const [note, setNote] = useState('')
  const [isSplit, setIsSplit] = useState(false)
  const [grossAmount, setGrossAmount] = useState<number | undefined>(undefined)
  const [teamSize, setTeamSize] = useState<number | undefined>(undefined)

  // Reset form state whenever the form is opened or editingIncome changes
  useEffect(() => {
    if (openForms.includes('income')) {
      const splitVal = income?.isSplit ?? false
      setAmount(income?.amount ?? 0)
      setSource(income?.source ?? '')
      setNote(income?.note ?? '')
      setIsSplit(splitVal)
      setGrossAmount(income?.grossAmount ?? undefined)
      setTeamSize(income?.teamSize ?? undefined)
      setIsSplitActive(splitVal)
    }
  }, [openForms.includes('income'), income?.id])

  // Sync isSplitActive to store whenever toggle changes
  const handleToggleSplit = (checked: boolean) => {
    setIsSplit(checked)
    setIsSplitActive(checked)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (amount <= 0) return

    const input = {
      periodMonth: income?.periodMonth ?? periodMonth ?? now.getMonth() + 1,
      periodYear: income?.periodYear ?? periodYear ?? now.getFullYear(),
      amount,
      source,
      note,
      isSplit,
      grossAmount,
      teamSize
    }

    if (isEdit && income) {
      await updateIncome(income.id, input)
    } else {
      await addIncome(input)
    }
    setIsSplitActive(false)
    closeForm('income')
  }

  const handleCancel = () => {
    setIsSplitActive(false)
    closeForm('income')
  }

  return (
    <form className="side-module-card cursor-no-drag" onSubmit={handleSubmit}>
      <h3 style={{ borderBottom: '1px solid rgba(201,161,59,0.3)', paddingBottom: '10px', margin: '0 0 16px 0', fontFamily: 'var(--font-display)', color: 'var(--noir-gold)', letterSpacing: '0.06em', fontSize: '15px' }}>
        {isEdit ? 'Edit Income' : 'Add Income'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0 16px 0', gap: isSplit ? '16px' : '14px' }}>
        <input
          type="text"
          placeholder="Source (e.g. Salary, Freelance)"
          className="form-input"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        {/* Team Project Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '13px', color: 'var(--noir-parchment)', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={isSplit}
              onChange={(e) => handleToggleSplit(e.target.checked)}
              style={{ accentColor: 'var(--noir-gold)', width: '14px', height: '14px' }}
            />
            <Users size={13} style={{ color: 'var(--noir-gold)', flexShrink: 0 }} />
            Team Project / Split Income
          </label>
        </div>

        {/* Split income expanded fields */}
        {isSplit && (
          <div style={{ background: 'rgba(201,161,59,0.05)', padding: '14px', border: '1px solid rgba(201,161,59,0.2)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CurrencyInput
              value={grossAmount || 0}
              onValueChange={setGrossAmount}
              placeholder="Total Project Payment (Gross)"
            />
            <input
              type="number"
              placeholder="Team Size (members)"
              className="form-input"
              value={teamSize || ''}
              onChange={(e) => setTeamSize(parseInt(e.target.value) || undefined)}
            />
            <div style={{ fontSize: '11px', color: 'var(--noir-muted)', marginTop: '-2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowRight size={10} />
              Suggested equal split: {(grossAmount && teamSize) ? fmtIDR(grossAmount / teamSize) : 'Rp 0'}
            </div>
          </div>
        )}

        <div>
          <CurrencyInput
            value={amount}
            onValueChange={setAmount}
            placeholder={isSplit ? 'Your Share' : 'Amount'}
            required
          />
          {isSplit && (
            <div style={{ fontSize: '11px', color: 'var(--noir-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowRight size={10} />
              {(grossAmount && amount > 0) ? ((amount / grossAmount) * 100).toFixed(1) : '0'}% of gross
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="Notes (optional)"
          className="form-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {isSplit && (
        <div style={{ fontSize: '11px', color: 'var(--noir-muted)', marginTop: 'auto', textAlign: 'center', marginBottom: '12px' }}>
          [Allocation] (dari share kamu aja)
        </div>
      )}

      <div className="flex justify-end gap-2 mt-auto pt-4" style={{ borderTop: '1px solid rgba(201,161,59,0.2)' }}>
        <button type="button" className="btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={amount <= 0}>
          Save
        </button>
      </div>
    </form>
  )
}
