import { create } from 'zustand'
import type { AllocationRecord, AllocationInput } from '../types/income'
import { useIncomeStore } from './useIncomeStore'

interface AllocationStore {
  allocations: AllocationRecord[]
  loading: boolean
  updateTrigger: number
  refresh: () => Promise<void>
  addAllocation: (input: AllocationInput) => Promise<void>
  updateAllocation: (id: string, input: AllocationInput) => Promise<void>
  deleteAllocation: (id: string) => Promise<void>
}

export const useAllocationStore = create<AllocationStore>()((set) => ({
  allocations: [],
  loading: false,
  updateTrigger: 0,

  refresh: async () => {
    set({ loading: true })
    try {
      // Get the currently active period from the Income store
      const { periodMonth, periodYear } = useIncomeStore.getState()
      const data = await window.api.getAllocationsByPeriod(periodMonth, periodYear)
      set({ allocations: data, loading: false })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },

  addAllocation: async (input) => {
    await window.api.addAllocation(input)
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await useAllocationStore.getState().refresh()
  },

  updateAllocation: async (id, input) => {
    await window.api.updateAllocation(id, input)
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await useAllocationStore.getState().refresh()
  },

  deleteAllocation: async (id) => {
    await window.api.deleteAllocation(id)
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await useAllocationStore.getState().refresh()
  }
}))
