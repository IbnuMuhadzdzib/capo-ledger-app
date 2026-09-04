import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/AppShell'
import PassbookPanel from './components/PassbookPanel'
import TellerPanel from './components/TellerPanel'
import IncomeForm from './components/IncomeForm'
import AllocationForm from './components/AllocationForm'
import { useIncomeStore } from './store/useIncomeStore'
import { useAppStore } from './store/useAppStore'
import { useAuthStore } from './store/useAuthStore'
import { useTellerStore } from './store/useTellerStore'
import RightModule from './components/RightModule'
import BottomPanel from './components/BottomPanel'
import ActivityLog from './components/ActivityLog'

// Total side panel height
const PANEL_H = 570
const GAP = 12

// Calculates the exact pixel height for a slot so the container never overflows.
function getSlotHeight(slot: string, currentSlots: string[]): number {
  if (currentSlots.length === 1) return PANEL_H;

  // 2 slots total = 558px (570 - 12 gap)
  // Form(s) are always at the top, activity-log always at the bottom.
  if (slot === 'activity-log') return 240;
  if (slot === 'income') return 318;
  if (slot === 'allocation') {
    // if stacked with income (no activity-log), split evenly
    if (currentSlots.includes('income')) return 279;
    return 318;
  }

  return 279;
}

export default function App() {
  const refresh = useIncomeStore((s) => s.refresh)
  const { openForms, isSplitActive } = useAppStore()

  const [slots, setSlots] = useState<string[]>(['activity-log'])
  // Track previous form count to distinguish direction of transition
  const prevOpenFormsLenRef = useRef(0)

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    // We safely attempt to listen only if the api exists
    if (window.api && window.api.onTrayAction) {
      window.api.onTrayAction(async (action) => {
        if (action === 'logout') {
          useAuthStore.getState().signOut()
        } else if (action === 'addIncome') {
          useAppStore.getState().openForm('income')
          useTellerStore.getState().say('addIncome')
        } else if (action === 'addAllocation') {
          useAppStore.getState().openForm('allocation')
          useTellerStore.getState().say('addIncome') // Using same voice line
        }
      })
    }
  }, [])

  useEffect(() => {
    const prevLen = prevOpenFormsLenRef.current

    if (openForms.length === 0) {
      // All forms closed: only activity log
      setSlots(['activity-log'])
    } else if (isSplitActive) {
      // Split income expands to full height
      setSlots(['income'])
    } else if (openForms.length === 1) {
      if (prevLen >= 2) {
        // Coming FROM 2 forms (cancelled one): remaining form stays TOP, activity-log enters from BELOW
        setSlots([openForms[0], 'activity-log'])
      } else {
        // Opening first form (0→1): activity-log stays TOP, form enters from BELOW
        setSlots(['activity-log', openForms[0]])
      }
    } else {
      // 2 forms: activity-log exits, first form TOP, second form enters from BELOW
      setSlots([openForms[0], openForms[1]])
    }

    prevOpenFormsLenRef.current = openForms.length
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
                return (
                  <motion.div
                    key="activity-log"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: getSlotHeight(slot, slots) }}
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
                    <ActivityLog isCompact={slots.length > 1} />
                  </motion.div>
                )
              }

              return (
                <motion.div
                  key={`form-${slot}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: getSlotHeight(slot, slots) }}
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
