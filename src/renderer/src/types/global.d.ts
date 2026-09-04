import type { IncomeInput, IncomeRecord, AllocationInput, AllocationRecord } from './income'

declare module '*.png' {
  const src: string
  export default src
}

export interface MonthSummary {
  month: number
  income: number
  allocated: number
  remaining: number
}

export interface MostWantedCategory {
  label: string
  total: number
}

export interface AssociateCategory {
  source: string
  total: number
}

export interface DailyActivity {
  day: string
  count: number
  total: number
}

declare global {
  interface Window {
    api: {
      // Incomes
      getIncomesByPeriod: (month: number, year: number) => Promise<IncomeRecord[]>
      getGrossProjectsByPeriod: (month: number, year: number) => Promise<number>
      getTotalByPeriod: (month: number, year: number) => Promise<number>
      getTotalAll: () => Promise<number>
      getYearlySummary: (year: number) => Promise<MonthSummary[]>
      getTopAssociates: (year: number) => Promise<AssociateCategory[]>
      getDailyActivity: (year: number) => Promise<DailyActivity[]>
      addIncome: (input: IncomeInput) => Promise<IncomeRecord>
      updateIncome: (id: string, input: IncomeInput) => Promise<IncomeRecord>
      deleteIncome: (id: string) => Promise<boolean>

      // Allocations
      getAllocationsByPeriod: (month: number, year: number) => Promise<AllocationRecord[]>
      getMostWantedAllocations: (year: number) => Promise<MostWantedCategory[]>
      addAllocation: (input: AllocationInput) => Promise<AllocationRecord>
      updateAllocation: (id: string, input: AllocationInput) => Promise<AllocationRecord>
      deleteAllocation: (id: string) => Promise<boolean>

      // Window
      minimizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      setWindowSize: (width: number, height: number) => Promise<void>
      setIgnoreMouseEvents: (ignore: boolean) => void
      moveDelta: (dx: number, dy: number) => void
      onTrayAction: (callback: (action: string) => void) => void
      sendTrayAction: (action: string) => void
    }
  }
}

export {}
