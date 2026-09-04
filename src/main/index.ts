import { app, BrowserWindow, Tray, nativeImage, screen } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipc'
import { setSetting } from './db'

let mainWindow: BrowserWindow | null = null
let trayWindow: BrowserWindow | null = null
let tray: Tray | null = null

function getTrayWindowPosition(): { x: number; y: number } | undefined {
  if (!tray || !trayWindow) return undefined
  const trayBounds = tray.getBounds()
  const windowBounds = trayWindow.getBounds()
  
  // Center horizontally relative to tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
  
  // Position above the taskbar on Windows (bottom taskbar typical)
  const y = Math.round(trayBounds.y - windowBounds.height - 10)
  
  return { x, y }
}

function createTrayWindow(): void {
  trayWindow = new BrowserWindow({
    width: 250,
    height: 230, // Adjusted down to fit without extra padding
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  trayWindow.on('blur', () => {
    trayWindow?.hide()
  })

  // Support transparent background
  trayWindow.setBackgroundColor('#00000000')

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    trayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/tray`)
  } else {
    trayWindow.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: '/tray' })
  }
}

function createTray(): void {
  const iconPath = path.join(__dirname, '../../resources/icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(icon)
  tray.setToolTip('Capo Ledger')

  createTrayWindow()

  const toggleTrayWindow = () => {
    if (trayWindow?.isVisible()) {
      trayWindow.hide()
    } else {
      const position = getTrayWindowPosition()
      if (position) {
        trayWindow?.setPosition(position.x, position.y, false)
      }
      trayWindow?.show()
      trayWindow?.focus()
    }
  }

  tray.on('click', toggleTrayWindow)
  tray.on('right-click', toggleTrayWindow)
}

function createWindow(): void {
  const savedWidth = 1450
  const savedHeight = 870

  // Center on primary display on first launch
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.round((screenW - savedWidth) / 2)
  const defaultY = Math.round((screenH - savedHeight) / 2) - 40
  const y = defaultY > 0 ? defaultY : 0

  mainWindow = new BrowserWindow({
    title: 'Capo Ledger',
    width: savedWidth,
    height: savedHeight,
    x,
    y,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    show: false,
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !app.isPackaged
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.setIgnoreMouseEvents(true, { forward: true })
  })

  // Hide to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  // Save window position when moved
  mainWindow.on('moved', () => {
    const [wx, wy] = mainWindow!.getPosition()
    setSetting('windowX', String(wx))
    setSetting('windowY', String(wy))
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  registerIpcHandlers(mainWindow)
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
})

// Don't quit when all windows are closed — the tray keeps the app alive
app.on('window-all-closed', () => {
  // On macOS, apps conventionally stay alive until Cmd+Q
  // On Windows/Linux, we keep alive because of the tray
  // Do NOT quit here — tray menu "Quit" handles real exit
})

let isQuitting = false
app.on('before-quit', () => {
  isQuitting = true
})
