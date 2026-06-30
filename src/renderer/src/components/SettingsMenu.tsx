import { useState } from 'react'
import { WINDOW_SIZE_PRESETS } from '../constants'

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)

  const applyPreset = async (width: number, height: number) => {
    await window.api.setWindowSize(width, height)
    setOpen(false)
  }

  return (
    <div className="settings-menu cursor-no-drag">
      <button
        className="window-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Window size"
      >
        ⚙
      </button>
      {open && (
        <div className="settings-popover">
          <p className="settings-popover-label">Window Size</p>
          {WINDOW_SIZE_PRESETS.map((p) => (
            <button
              key={p.label}
              className="settings-preset-btn"
              onClick={() => applyPreset(p.width, p.height)}
            >
              {p.label} ({p.width}×{p.height})
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
