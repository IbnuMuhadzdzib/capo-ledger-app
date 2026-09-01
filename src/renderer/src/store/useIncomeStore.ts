import { create } from 'zustand'
import type { IncomeInput, IncomeRecord } from '../types/income'
import { useTellerStore } from './useTellerStore'
import { useAllocationStore } from './useAllocationStore'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'

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
    const user = useAuthStore.getState().user
    
    if (!user) {
      set({ error: 'Not authenticated', isLoading: false })
      return
    }

    set({ isLoading: true, error: null })
    try {
      // 1. Fetch current period incomes
      const { data: periodIncomes, error: periodError } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_month', periodMonth)
        .eq('period_year', periodYear)
        .order('created_at', { ascending: false })

      if (periodError) throw new Error(periodError.message)

      // 2. Fetch all incomes just to get the totalAll (using amount only for efficiency)
      const { data: allIncomes, error: allError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('user_id', user.id)

      if (allError) throw new Error(allError.message)

      // Calculate totals
      const incomes = (periodIncomes || []).map((row: any) => ({
        id: row.id,
        periodMonth: row.period_month,
        periodYear: row.period_year,
        amount: row.amount,
        source: row.source,
        note: row.note,
        createdAt: row.created_at,
        isSplit: row.is_split,
        grossAmount: row.gross_amount,
        teamSize: row.team_size
      })) as IncomeRecord[]

      const totalPeriod = incomes.reduce((sum, item) => sum + item.amount, 0)
      const totalAll = (allIncomes || []).reduce((sum, item) => sum + item.amount, 0)
      
      const grossProjectsByPeriod = incomes.reduce((sum, item) => {
        return sum + (item.isSplit ? (item.grossAmount || 0) : 0)
      }, 0)

      set({ incomes, totalPeriod, totalAll, grossProjectsByPeriod, isLoading: false })
      
      // Also refresh allocations for the new period
      await useAllocationStore.getState().refresh()

      if (incomes.length === 0) {
        useTellerStore.getState().say('emptyPeriod')
      }
    } catch (err: any) {
      console.error(err)
      set({ error: err.message, isLoading: false })
    }
  },

  addIncome: async (input) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const newId = crypto.randomUUID()
    const { error } = await supabase.from('incomes').insert({
      id: newId,
      user_id: user.id,
      period_month: input.periodMonth,
      period_year: input.periodYear,
      amount: input.amount,
      source: input.source,
      note: input.note,
      is_split: input.isSplit ?? false,
      gross_amount: input.grossAmount ?? null,
      team_size: input.teamSize ?? null
    })

    if (error) console.error('Add income error:', error.message)
    
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await get().refresh()
  },

  updateIncome: async (id, input) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { error } = await supabase.from('incomes')
      .update({
        period_month: input.periodMonth,
        period_year: input.periodYear,
        amount: input.amount,
        source: input.source,
        note: input.note,
        is_split: input.isSplit ?? false,
        gross_amount: input.grossAmount ?? null,
        team_size: input.teamSize ?? null
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) console.error('Update income error:', error.message)
    
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await get().refresh()
  },

  deleteIncome: async (id) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { error } = await supabase.from('incomes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) console.error('Delete income error:', error.message)
    
    set((state) => ({ updateTrigger: state.updateTrigger + 1 }))
    await get().refresh()
  }
}))
