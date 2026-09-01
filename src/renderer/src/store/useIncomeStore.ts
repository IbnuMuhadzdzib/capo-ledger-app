import { create } from 'zustand'
import type { IncomeInput, IncomeRecord } from '../types/income'
import { useTellerStore } from './useTellerStore'
import { useAllocationStore } from './useAllocationStore'

interface IncomeStore {
  periodMonth: number
  periodYear: number
  incomes: IncomeRecord[]
  totalPeriod: number
  totalAll: number
  grossProjectsByPeriod: number
  isLoading: boolean
  error: string | null
  updateTrigger: number

  setPeriod: (month: number, year: number) => void
  goToNextPeriod: () => void
  goToPreviousPeriod: () => void
  refresh: () => Promise<void>
  addIncome: (input: IncomeInput) => Promise<void>
  updateIncome: (id: string, input: IncomeInput) => Promise<void>
  deleteIncome: (id: string) => Promise<void>
}

const now = new Date()

export const useIncomeStore = create<IncomeStore>()((set, get) => ({
  periodMonth: now.getMonth() + 1,
  periodYear: now.getFullYear(),
  incomes: [],
  totalPeriod: 0,
  totalAll: 0,
  grossProjectsByPeriod: 0,
  isLoading: false,
  error: null,
  updateTrigger: 0,

  setPeriod: (month, year) => {
    set({ periodMonth: month, periodYear: year })
    get().refresh()
  },

  goToNextPeriod: () => {
    const { periodMonth, periodYear } = get()
    const next = periodMonth === 12 ? 1 : periodMonth + 1
    const nextYear = periodMonth === 12 ? periodYear + 1 : periodYear
    get().setPeriod(next, nextYear)
  },

  goToPreviousPeriod: () => {
    const { periodMonth, periodYear } = get()
    const prev = periodMonth === 1 ? 12 : periodMonth - 1
    const prevYear = periodMonth === 1 ? periodYear - 1 : periodYear
    get().setPeriod(prev, prevYear)
  },

  refresh: async () => {
    const { periodMonth, periodYear } = get()
    set({ isLoading: true, error: null })
    try {
      const [incomes, totalPeriod, totalAll, grossProjectsByPeriod] = await Promise.all([
        window.api.getIncomesByPeriod(periodMonth, periodYear),
        window.api.getTotalByPeriod(periodMonth, periodYear),
        window.api.getTotalAll(),
        window.api.getGrossProjectsByPeriod(periodMonth, periodYear)
      ])
      set({ incomes, totalPeriod, totalAll, grossProjectsByPeriod, isLoading: false })
      
      // Also refresh allocations for the new period
      await useAllocationStore.getState().refresh()

      if (incomes.length === 0) {
        useTellerStore.getState().say('emptyPeriod')
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  addIncome: async (input) => {
    await window.api.addIncome(input)
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await get().refresh()
  },

  updateIncome: async (id, input) => {
    await window.api.updateIncome(id, input)
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await get().refresh()
  },

  deleteIncome: async (id) => {
    await window.api.deleteIncome(id)
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await get().refresh()
  }
}))
