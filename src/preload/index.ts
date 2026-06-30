import { contextBridge, ipcRenderer } from 'electron'

// Inline types here to avoid importing from ../main/db which is Node-only
// and would break tsconfig.web.json checks
interface IncomeInput {
  periodMonth: number
  periodYear: number
  amount: number
  source: string
  note: string
}

interface AllocationInput {
  periodMonth: number
  periodYear: number
  label: string
  amount: number
}

const api = {
  getIncomesByPeriod: (month: number, year: number) =>
    ipcRenderer.invoke('incomes:getByPeriod', month, year),
  getTotalByPeriod: (month: number, year: number) =>
    ipcRenderer.invoke('incomes:getTotalByPeriod', month, year),
  getTotalAll: () => ipcRenderer.invoke('incomes:getTotalAll'),
  getYearlySummary: (year: number) => ipcRenderer.invoke('incomes:getYearlySummary', year),
  getTopAssociates: (year: number) => ipcRenderer.invoke('incomes:getTopAssociates', year),
  getDailyActivity: (year: number) => ipcRenderer.invoke('incomes:getDailyActivity', year),
  addIncome: (input: IncomeInput) => ipcRenderer.invoke('incomes:add', input),
  updateIncome: (id: string, input: IncomeInput) =>
    ipcRenderer.invoke('incomes:update', id, input),
  deleteIncome: (id: string) => ipcRenderer.invoke('incomes:delete', id),
  
  getAllocationsByPeriod: (month: number, year: number) =>
    ipcRenderer.invoke('allocations:getByPeriod', month, year),
  getMostWantedAllocations: (year: number) => ipcRenderer.invoke('allocations:getMostWanted', year),
  addAllocation: (input: AllocationInput) => ipcRenderer.invoke('allocations:add', input),
  updateAllocation: (id: string, input: AllocationInput) =>
    ipcRenderer.invoke('allocations:update', id, input),
  deleteAllocation: (id: string) => ipcRenderer.invoke('allocations:delete', id),

  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  setWindowSize: (width: number, height: number) =>
    ipcRenderer.invoke('window:setSize', width, height),
  setIgnoreMouseEvents: (ignore: boolean) =>
    ipcRenderer.send('window:setIgnoreMouseEvents', ignore),
  moveDelta: (dx: number, dy: number) =>
    ipcRenderer.send('window:moveDelta', dx, dy)
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
