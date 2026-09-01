export interface AllocationInput {
  periodMonth: number
  periodYear: number
  label: string
  amount: number
}

export interface AllocationRecord extends AllocationInput {
  id: string
  createdAt: string
}

export interface IncomeInput {
  periodMonth: number
  periodYear: number
  amount: number
  source: string
  note: string
  isSplit?: boolean
  grossAmount?: number | null
  teamSize?: number | null
}

export interface IncomeRecord extends IncomeInput {
  id: string
  createdAt: string
}
