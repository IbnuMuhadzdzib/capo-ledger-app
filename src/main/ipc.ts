import { ipcMain, BrowserWindow } from 'electron'
import {
  getIncomesByPeriod,
  getGrossProjectsByPeriod,
  getTotalByPeriod,
  getTotalAll,
  getYearlySummary,
  addIncome,
  updateIncome,
  deleteIncome,
  getAllocationsByPeriod,
  getMostWantedAllocations,
  addAllocation,
  updateAllocation,
  deleteAllocation,
  setSetting,
  getTopAssociates,
  getDailyActivity,
  IncomeInput,
  AllocationInput
} from './db'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('incomes:getByPeriod', (_e, month: number, year: number) =>
    getIncomesByPeriod(month, year)
  )

  ipcMain.handle('incomes:getGrossProjectsByPeriod', (_e, month: number, year: number) =>
    getGrossProjectsByPeriod(month, year)
  )

  ipcMain.handle('incomes:getTotalByPeriod', (_e, month: number, year: number) =>
    getTotalByPeriod(month, year)
  )

  ipcMain.handle('incomes:getTotalAll', () => getTotalAll())

  ipcMain.handle('incomes:getYearlySummary', (_e, year: number) => getYearlySummary(year))

  ipcMain.handle('incomes:getTopAssociates', (_e, year: number) => getTopAssociates(year))

  ipcMain.handle('incomes:getDailyActivity', (_e, year: number) => getDailyActivity(year))

  ipcMain.handle('incomes:add', (_e, input: IncomeInput) => addIncome(input))

  ipcMain.handle('incomes:update', (_e, id: string, input: IncomeInput) =>
    updateIncome(id, input)
  )

  ipcMain.handle('incomes:delete', (_e, id: string) => {
    deleteIncome(id)
    return true
  })

  // Allocations
  ipcMain.handle('allocations:getByPeriod', (_e, month: number, year: number) =>
    getAllocationsByPeriod(month, year)
  )

  ipcMain.handle('allocations:getMostWanted', (_e, year: number) =>
    getMostWantedAllocations(year)
  )

  ipcMain.handle('allocations:add', (_e, input: AllocationInput) => addAllocation(input))

  ipcMain.handle('allocations:update', (_e, id: string, input: AllocationInput) =>
    updateAllocation(id, input)
  )

  ipcMain.handle('allocations:delete', (_e, id: string) => {
    deleteAllocation(id)
    return true
  })

  // Window Controls
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.handle('window:close', () => {
    mainWindow.hide()
  })

  // Custom drag: renderer sends delta on mousemove while dragging header
  ipcMain.on('window:moveDelta', (_e, dx: number, dy: number) => {
    const [x, y] = mainWindow.getPosition()
    mainWindow.setPosition(Math.round(x + dx), Math.round(y + dy))
  })

  // Toggle click-through: renderer calls this on mousemove to pass through transparent areas
  ipcMain.on('window:setIgnoreMouseEvents', (_e, ignore: boolean) => {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true })
  })

  ipcMain.handle('window:setSize', (_e, width: number, height: number) => {
    const [currentWidth] = mainWindow.getSize()
    const [x, y] = mainWindow.getPosition()
    
    // Hitung posisi X baru agar sisi KANAN window tidak bergerak
    const deltaWidth = width - currentWidth
    const newX = x - deltaWidth

    // Gunakan setBounds agar perubahan posisi dan ukuran terjadi bersamaan
    // Matikan animasi (false) untuk menghindari flickering/blinking brutal di Windows
    mainWindow.setBounds({ x: newX, y, width, height }, false)
    
    setSetting('windowWidth', String(width))
    setSetting('windowHeight', String(height))
  })
}
