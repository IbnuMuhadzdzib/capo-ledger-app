import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/AppShell'
import PassbookPanel from './components/PassbookPanel'
import TellerPanel from './components/TellerPanel'
import IncomeForm from './components/IncomeForm'
import AllocationForm from './components/AllocationForm'
import { useIncomeStore } from './store/useIncomeStore'
import { useAppStore } from './store/useAppStore'
import RightModule from './components/RightModule'
import BottomPanel from './components/BottomPanel'
import ActivityLog from './components/ActivityLog'

export default function App() {
  const refresh = useIncomeStore((s) => s.refresh)
  const { openForms, closeForm } = useAppStore()

  const [slots, setSlots] = useState<string[]>(['activity-log'])
  const prevOpenFormsRef = useRef<string[]>(openForms)

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const prev = prevOpenFormsRef.current
    if (prev.length === 2 && openForms.length === 1) {
      if (openForms[0] === prev[0]) {
        // Form paling bawah di-cancel, form yang di atas ikut di-cancel
        setTimeout(() => closeForm(openForms[0] as 'income' | 'allocation'), 0)
      }
    }
    prevOpenFormsRef.current = openForms
  }, [openForms, closeForm])

  useEffect(() => {
    setSlots((prev) => {
      let next = [...prev]

      // Zero-flash visual removal: if we are about to auto-cancel the top form,
      // skip the intermediate state and immediately return to full activity log.
      if (prevOpenFormsRef.current.length === 2 && openForms.length === 1) {
        if (openForms[0] === prevOpenFormsRef.current[0]) {
          return ['activity-log']
        }
      }

      next = next.filter((id) => id === 'activity-log' || openForms.includes(id as 'income' | 'allocation'))
      
      const newlyOpened = openForms.filter((id) => !prev.includes(id))
      let formsToClose: string[] = []

      for (const id of newlyOpened) {
        next.push(id)
        if (next.length > 2) {
          const removed = next.shift()
          if (removed && removed !== 'activity-log') {
            formsToClose.push(removed)
          }
        }
      }

      formsToClose.forEach((form) => {
        setTimeout(() => closeForm(form as 'income' | 'allocation'), 0)
      })

      if (openForms.length === 0) return ['activity-log']
      if (openForms.length === 1 && next.length === 1 && !next.includes('activity-log')) {
        next.unshift('activity-log') // Masukkan dari atas agar form add di bawah
      }
      return next
    })
  }, [openForms, closeForm])

  return (
    <AppShell>
      <div className="layout-root">
        <div className="side-module" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '570px', overflow: 'hidden' }}>
          <AnimatePresence initial={false}>
            {slots.map((slot) => {
              if (slot === 'activity-log') {
                const targetHeight = slots.length === 1 ? 570 : (slots.includes('income') ? 240 : 290)
                return (
                  <motion.div
                    key="activity-log"
                    initial={{ opacity: 0, y: 570, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1, height: targetHeight }}
                    exit={{ opacity: 0, y: -30, scale: 0.95, height: 0, overflow: 'hidden', transition: { duration: 0.18 } }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    style={{ 
                      width: '100%', 
                      flexShrink: 0,
                      transformOrigin: 'top center',
                      background: 'var(--noir-card)',
                      border: '1px solid var(--noir-border-dim)',
                      borderRadius: '6px',
                      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(201, 161, 59, 0.06)',
                      overflow: 'hidden'
                    }}
                  >
                    <ActivityLog isCompact={slots.length > 1} />
                  </motion.div>
                )
              }

              return (
                <motion.div
                  key={`form-${slot}`}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1, height: 'auto' }}
                  exit={{ opacity: 0, y: -30, scale: 0.95, height: 0, overflow: 'hidden', transition: { duration: 0.18 } }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  style={{ width: '100%', flexShrink: 0 }}
                >
                  {slot === 'income' ? <IncomeForm /> : <AllocationForm />}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="main-module">
          <PassbookPanel />
          <TellerPanel />
        </div>

        <RightModule />

        <BottomPanel />
      </div>
    </AppShell>
  )
}
