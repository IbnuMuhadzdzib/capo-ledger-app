import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'
import type { MonthSummary, MostWantedCategory, AssociateCategory, DailyActivity } from '../types/global'

export async function getYearlySummary(year: number): Promise<MonthSummary[]> {
  const user = useAuthStore.getState().user
  if (!user) return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, allocated: 0, remaining: 0 }))

  const [{ data: incomes }, { data: allocs }] = await Promise.all([
    supabase.from('incomes').select('period_month, amount').eq('period_year', year).eq('user_id', user.id),
    supabase.from('allocations').select('period_month, amount').eq('period_year', year).eq('user_id', user.id)
  ])

  const summary = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    allocated: 0,
    remaining: 0
  }))

  incomes?.forEach((inc: any) => {
    summary[inc.period_month - 1].income += inc.amount
  })
  
  allocs?.forEach((al: any) => {
    summary[al.period_month - 1].allocated += al.amount
  })

  summary.forEach((s) => {
    s.remaining = s.income - s.allocated
  })

  return summary
}

export async function getMostWantedAllocations(year: number): Promise<MostWantedCategory[]> {
  const user = useAuthStore.getState().user
  if (!user) return []

  const { data: allocs } = await supabase
    .from('allocations')
    .select('label, amount')
    .eq('period_year', year)
    .eq('user_id', user.id)

  const map = new Map<string, number>()
  allocs?.forEach((al: any) => {
    map.set(al.label, (map.get(al.label) || 0) + al.amount)
  })

  const sorted = Array.from(map.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return sorted
}

export async function getTopAssociates(year: number): Promise<AssociateCategory[]> {
  const user = useAuthStore.getState().user
  if (!user) return []

  const { data: incomes } = await supabase
    .from('incomes')
    .select('source, amount')
    .eq('period_year', year)
    .eq('user_id', user.id)

  const map = new Map<string, number>()
  incomes?.forEach((inc: any) => {
    map.set(inc.source, (map.get(inc.source) || 0) + inc.amount)
  })

  const sorted = Array.from(map.entries())
    .map(([source, total]) => ({ source, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return sorted
}

export async function getDailyActivity(year: number): Promise<DailyActivity[]> {
  const user = useAuthStore.getState().user
  if (!user) return []

  const [{ data: incomes }, { data: allocs }] = await Promise.all([
    supabase.from('incomes').select('created_at, amount').eq('period_year', year).eq('user_id', user.id),
    supabase.from('allocations').select('created_at, amount').eq('period_year', year).eq('user_id', user.id)
  ])

  const map = new Map<string, { count: number; total: number }>()
  
  const processItem = (item: any) => {
    // Convert to target timezone/day string YYYY-MM-DD
    const dateStr = item.created_at.split('T')[0]
    const cur = map.get(dateStr) || { count: 0, total: 0 }
    cur.count += 1
    cur.total += item.amount
    map.set(dateStr, cur)
  }

  incomes?.forEach(processItem)
  allocs?.forEach(processItem)

  const result: DailyActivity[] = []
  map.forEach((val, day) => {
    result.push({ day, count: val.count, total: val.total })
  })

  return result
}
