import { useEffect, useState } from 'react'
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

// Total side panel height
const PANEL_H = 570
// Gap between slots
const GAP = 12
// Activity log compact height when a form is also visible
const LOG_COMPACT = 240
// Form height in normal mode (fills the remaining space)
const FORM_NORMAL_H = PANEL_H - LOG_COMPACT - GAP // 318px

export default function App() {
  const refresh = useIncomeStore((s) => s.refresh)
  const { openForms, isSplitActive } = useAppStore()

  const [slots, setSlots] = useState<string[]>(['activity-log'])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (openForms.length === 0) {
      setSlots(['activity-log'])
    } else if (isSplitActive) {
      // Split ON: form takes full 570px, activity log hidden
      const latestForm = openForms[openForms.length - 1]
      setSlots([latestForm])
    } else {
      // Split OFF: compact activity log + form below
      const latestForm = openForms[openForms.length - 1]
      setSlots(['activity-log', latestForm])
    }
  }, [openForms, isSplitActive])

  return (
    <AppShell>
      <div className="layout-root">
        <div
          className="side-module"
          style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, height: `${PANEL_H}px`, overflow: 'hidden' }}
        >
          <AnimatePresence initial={false}>
            {slots.map((slot) => {
              if (slot === 'activity-log') {
                const hasForm = slots.some(s => s !== 'activity-log')
                const logH = hasForm ? LOG_COMPACT : PANEL_H
                return (
                  <motion.div
                    key="activity-log"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: logH }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    style={{
                      width: '100%',
                      flexShrink: 0,
                      background: 'var(--noir-card)',
                      border: '1px solid var(--noir-border-dim)',
                      borderRadius: '6px',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,161,59,0.06)',
                      overflow: 'hidden'
                    }}
                  >
                    <ActivityLog isCompact={hasForm} />
                  </motion.div>
                )
              }

              // Form slot — height depends on split mode
              const formH = isSplitActive ? PANEL_H : FORM_NORMAL_H
              return (
                <motion.div
                  key={`form-${slot}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: formH }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  style={{ width: '100%', flexShrink: 0, overflow: 'hidden' }}
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
