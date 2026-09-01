import { app } from 'electron'
import Database from 'better-sqlite3'
import path from 'path'
import { randomUUID } from 'crypto'

export interface IncomeRow {
  id: string
  periodMonth: number
  periodYear: number
  amount: number
  source: string
  note: string
  createdAt: string
  isSplit?: boolean
  grossAmount?: number | null
  teamSize?: number | null
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

export interface AllocationRow {
  id: string
  periodMonth: number
  periodYear: number
  label: string
  amount: number
  createdAt: string
}

export interface AllocationInput {
  periodMonth: number
  periodYear: number
  label: string
  amount: number
}

// Disimpan di folder data user (bukan di folder install app), jadi tetap writable
// dan tetap ada walau aplikasinya nanti di-update/reinstall.
const dbPath = path.join(app.getPath('userData'), 'income-book.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Migration: Drop old allocations table if it has income_id
try {
  const tableInfo = db.prepare('PRAGMA table_info(allocations)').all() as any[];
  if (tableInfo.some(col => col.name === 'income_id')) {
    db.exec('DROP TABLE allocations;');
  }
} catch (e) {
  console.error('Migration check failed', e)
}

// Migration: Add new columns to incomes table if they don't exist
try {
  const tableInfo = db.prepare('PRAGMA table_info(incomes)').all() as any[];
  if (!tableInfo.some(col => col.name === 'is_split')) {
    db.exec('ALTER TABLE incomes ADD COLUMN is_split BOOLEAN DEFAULT 0;');
    db.exec('ALTER TABLE incomes ADD COLUMN gross_amount REAL DEFAULT NULL;');
    db.exec('ALTER TABLE incomes ADD COLUMN team_size INTEGER DEFAULT NULL;');
  }
} catch (e) {
  console.error('Migration incomes columns failed', e)
}

db.exec(`
  CREATE TABLE IF NOT EXISTS incomes (
    id TEXT PRIMARY KEY,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    amount REAL NOT NULL,
    source TEXT DEFAULT '',
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    is_split BOOLEAN DEFAULT 0,
    gross_amount REAL DEFAULT NULL,
    team_size INTEGER DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS allocations (
    id TEXT PRIMARY KEY,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    label TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_incomes_period ON incomes(period_year, period_month);
  CREATE INDEX IF NOT EXISTS idx_allocations_period ON allocations(period_year, period_month);
`)

function mapIncomeRow(row: any): IncomeRow {
  return {
    id: row.id,
    periodMonth: row.period_month,
    periodYear: row.period_year,
    amount: row.amount,
    source: row.source ?? '',
    note: row.note ?? '',
    createdAt: row.created_at,
    isSplit: Boolean(row.is_split),
    grossAmount: row.gross_amount ?? null,
    teamSize: row.team_size ?? null
  }
}

function mapAllocationRow(row: any): AllocationRow {
  return {
    id: row.id,
    periodMonth: row.period_month,
    periodYear: row.period_year,
    label: row.label,
    amount: row.amount,
    createdAt: row.created_at
  }
}

// ================= INCOMES =================

export function getIncomesByPeriod(month: number, year: number): IncomeRow[] {
  const rows = db
    .prepare(
      'SELECT * FROM incomes WHERE period_month = ? AND period_year = ? ORDER BY created_at ASC'
    )
    .all(month, year) as any[]
  return rows.map(mapIncomeRow)
}

export function getGrossProjectsByPeriod(month: number, year: number): number {
  const row = db
    .prepare(
      'SELECT COALESCE(SUM(gross_amount), 0) as total FROM incomes WHERE period_month = ? AND period_year = ? AND is_split = 1'
    )
    .get(month, year) as { total: number }
  return row.total
}

export function getTotalByPeriod(month: number, year: number): number {
  const row = db
    .prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE period_month = ? AND period_year = ?'
    )
    .get(month, year) as { total: number }
  return row.total
}

export function getTotalAll(): number {
  const row = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM incomes').get() as {
    total: number
  }
  return row.total
}

export interface MonthSummary {
  month: number
  income: number
  allocated: number
  remaining: number
}

export function getYearlySummary(year: number): MonthSummary[] {
  // Get income totals per month for the year
  const incomeRows = db
    .prepare(
      'SELECT period_month as month, COALESCE(SUM(amount), 0) as total FROM incomes WHERE period_year = ? GROUP BY period_month'
    )
    .all(year) as { month: number; total: number }[]

  // Get allocation totals per month for the year
  const allocRows = db
    .prepare(
      'SELECT period_month as month, COALESCE(SUM(amount), 0) as total FROM allocations WHERE period_year = ? GROUP BY period_month'
    )
    .all(year) as { month: number; total: number }[]

  const incomeMap = new Map(incomeRows.map((r) => [r.month, r.total]))
  const allocMap = new Map(allocRows.map((r) => [r.month, r.total]))

  // Return all 12 months, even if there's no data
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const income = incomeMap.get(month) ?? 0
    const allocated = allocMap.get(month) ?? 0
    return { month, income, allocated, remaining: income - allocated }
  })
}


export function addIncome(input: IncomeInput): IncomeRow {
  const id = randomUUID()
  const createdAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO incomes (id, period_month, period_year, amount, source, note, created_at, is_split, gross_amount, team_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.periodMonth,
    input.periodYear,
    input.amount,
    input.source,
    input.note,
    createdAt,
    input.isSplit ? 1 : 0,
    input.grossAmount ?? null,
    input.teamSize ?? null
  )

  return mapIncomeRow({
    id,
    period_month: input.periodMonth,
    period_year: input.periodYear,
    amount: input.amount,
    source: input.source,
    note: input.note,
    created_at: createdAt,
    is_split: input.isSplit ? 1 : 0,
    gross_amount: input.grossAmount ?? null,
    team_size: input.teamSize ?? null
  })
}

export function updateIncome(id: string, input: IncomeInput): IncomeRow {
  db.prepare(
    `UPDATE incomes SET period_month = ?, period_year = ?, amount = ?, source = ?, note = ?, is_split = ?, gross_amount = ?, team_size = ?
     WHERE id = ?`
  ).run(input.periodMonth, input.periodYear, input.amount, input.source, input.note, input.isSplit ? 1 : 0, input.grossAmount ?? null, input.teamSize ?? null, id)

  const row = db.prepare('SELECT * FROM incomes WHERE id = ?').get(id) as any
  return mapIncomeRow(row)
}

export function deleteIncome(id: string): void {
  db.prepare('DELETE FROM incomes WHERE id = ?').run(id)
}

export interface AssociateCategory {
  source: string
  total: number
}

export function getTopAssociates(year: number): AssociateCategory[] {
  return db
    .prepare(
      'SELECT source, SUM(amount) as total FROM incomes WHERE period_year = ? GROUP BY source ORDER BY total DESC LIMIT 5'
    )
    .all(year) as AssociateCategory[]
}

export interface DailyActivity {
  day: string   // 'YYYY-MM-DD'
  count: number
  total: number
}

export function getDailyActivity(year: number): DailyActivity[] {
  const y = String(year)
  return db
    .prepare(
      `SELECT strftime('%Y-%m-%d', created_at) as day,
              COUNT(*) as count,
              COALESCE(SUM(amount), 0) as total
       FROM (
         SELECT created_at, amount FROM incomes WHERE strftime('%Y', created_at) = ?
         UNION ALL
         SELECT created_at, amount FROM allocations WHERE strftime('%Y', created_at) = ?
       )
       GROUP BY day
       ORDER BY day`
    )
    .all(y, y) as DailyActivity[]
}

// ================= ALLOCATIONS =================

export interface MostWantedCategory {
  label: string
  total: number
}

export function getMostWantedAllocations(year: number): MostWantedCategory[] {
  return db
    .prepare(
      'SELECT label, SUM(amount) as total FROM allocations WHERE period_year = ? GROUP BY label ORDER BY total DESC LIMIT 5'
    )
    .all(year) as MostWantedCategory[]
}

export function getAllocationsByPeriod(month: number, year: number): AllocationRow[] {
  const rows = db
    .prepare(
      'SELECT * FROM allocations WHERE period_month = ? AND period_year = ? ORDER BY created_at ASC'
    )
    .all(month, year) as any[]
  return rows.map(mapAllocationRow)
}

export function addAllocation(input: AllocationInput): AllocationRow {
  const id = randomUUID()
  const createdAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO allocations (id, period_month, period_year, label, amount, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, input.periodMonth, input.periodYear, input.label, input.amount, createdAt)

  return mapAllocationRow({
    id,
    period_month: input.periodMonth,
    period_year: input.periodYear,
    label: input.label,
    amount: input.amount,
    created_at: createdAt
  })
}

export function updateAllocation(id: string, input: AllocationInput): AllocationRow {
  db.prepare(
    `UPDATE allocations SET period_month = ?, period_year = ?, label = ?, amount = ?
     WHERE id = ?`
  ).run(input.periodMonth, input.periodYear, input.label, input.amount, id)

  const row = db.prepare('SELECT * FROM allocations WHERE id = ?').get(id) as any
  return mapAllocationRow(row)
}

export function deleteAllocation(id: string): void {
  db.prepare('DELETE FROM allocations WHERE id = ?').run(id)
}

// ================= SETTINGS =================

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`)

export function getSetting(key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value)
}
