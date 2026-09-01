import { create } from 'zustand'
import type { IncomeRecord, AllocationRecord } from '../types/income'

interface AppStore {
  openForms: ('income' | 'allocation')[]
  editingIncome: IncomeRecord | null
  editingAllocation: AllocationRecord | null
  activeTab: 'daftar' | 'alokasi'
  isSplitActive: boolean
  setActiveTab: (tab: 'daftar' | 'alokasi') => void
  setIsSplitActive: (value: boolean) => void
  openForm: (type: 'income' | 'allocation', data?: IncomeRecord | AllocationRecord) => void
  closeForm: (type: 'income' | 'allocation') => void
}

export const useAppStore = create<AppStore>()((set) => ({
  openForms: [],
  editingIncome: null,
  editingAllocation: null,
  activeTab: 'daftar',
  isSplitActive: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsSplitActive: (value) => set({ isSplitActive: value }),
  openForm: (type, data) => set((state) => {
    const newForms = state.openForms.includes(type) 
      ? state.openForms 
      : [...state.openForms, type]
    
    return {
      openForms: newForms,
      ...(type === 'income' ? { editingIncome: (data as IncomeRecord) || null } : {}),
      ...(type === 'allocation' ? { editingAllocation: (data as AllocationRecord) || null } : {})
    }
  }),
  closeForm: (type) => set((state) => ({
    openForms: state.openForms.filter((f) => f !== type),
    ...(type === 'income' ? { editingIncome: null } : {}),
    ...(type === 'allocation' ? { editingAllocation: null } : {})
  }))
}))
