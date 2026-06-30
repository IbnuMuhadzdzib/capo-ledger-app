import { useEffect, useRef, useState } from 'react'
import { useTellerStore } from '../store/useTellerStore'
import { useAllocationStore } from '../store/useAllocationStore'
import { useIncomeStore } from '../store/useIncomeStore'
import TellerAvatar, { type TellerVariant } from './TellerAvatar'

export default function TellerPanel() {
  const line = useTellerStore((s) => s.line)
  const allocations = useAllocationStore((s) => s.allocations)
  const totalPeriod = useIncomeStore((s) => s.totalPeriod)
  const [talking, setTalking] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setTalking(true)
    timeoutRef.current = setTimeout(() => setTalking(false), 2000)
    return () => clearTimeout(timeoutRef.current)
  }, [line])

  // Determine which avatar variant to show
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0)
  const isInMinus = totalPeriod > 0 && totalAllocated > totalPeriod

  let variant: TellerVariant = 'default'
  if (talking) variant = 'dialogue'
  else if (isInMinus) variant = 'minus'

  return (
    <div className="teller-panel">
      <TellerAvatar variant={variant} />
    </div>
  )
}
