import { useState, useEffect } from 'react'

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number
  onValueChange: (value: number) => void
}

export default function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Sync internal display state when value prop changes (e.g., initial load or form reset)
  useEffect(() => {
    if (value === 0) {
      setDisplayValue('')
    } else {
      setDisplayValue(value.toLocaleString('id-ID'))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const rawValue = e.target.value.replace(/\D/g, '')
    
    if (rawValue === '') {
      setDisplayValue('')
      onValueChange(0)
      return
    }

    const numericValue = parseInt(rawValue, 10)
    if (!isNaN(numericValue)) {
      // Format with thousands separator for Indonesian Locale
      setDisplayValue(numericValue.toLocaleString('id-ID'))
      onValueChange(numericValue)
    }
  }

  return (
    <div className={`relative ${className || ''}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: '2.5rem' }}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
}
