import { create } from 'zustand'
import type { AllocationRecord, AllocationInput } from '../types/income'
import { useIncomeStore } from './useIncomeStore'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'

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
      const user = useAuthStore.getState().user
      if (!user) {
        set({ loading: false })
        return
      }

      // Get the currently active period from the Income store
      const { periodMonth, periodYear } = useIncomeStore.getState()
      
      const { data, error } = await supabase
        .from('allocations')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_month', periodMonth)
        .eq('period_year', periodYear)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      const formatted = (data || []).map((row: any) => ({
        id: row.id,
        periodMonth: row.period_month,
        periodYear: row.period_year,
        amount: row.amount,
        label: row.label,
        createdAt: row.created_at
      })) as AllocationRecord[]

      set({ allocations: formatted, loading: false })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },

  addAllocation: async (input) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const newId = crypto.randomUUID()
    const { error } = await supabase.from('allocations').insert({
      id: newId,
      user_id: user.id,
      period_month: input.periodMonth,
      period_year: input.periodYear,
      amount: input.amount,
      label: input.label
    })

    if (error) console.error('Add allocation error:', error.message)

    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await useAllocationStore.getState().refresh()
  },

  updateAllocation: async (id, input) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { error } = await supabase.from('allocations')
      .update({
        period_month: input.periodMonth,
        period_year: input.periodYear,
        amount: input.amount,
        label: input.label
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) console.error('Update allocation error:', error.message)

    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await useAllocationStore.getState().refresh()
  },

  deleteAllocation: async (id) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { error } = await supabase.from('allocations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) console.error('Delete allocation error:', error.message)

    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await useAllocationStore.getState().refresh()
  }
}))
