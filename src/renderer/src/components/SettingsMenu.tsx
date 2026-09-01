import { useState } from 'react'
import { WINDOW_SIZE_PRESETS } from '../constants'
import { useAuthStore } from '../store/useAuthStore'

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const { signOut } = useAuthStore()

  const applyPreset = async (width: number, height: number) => {
    await window.api.setWindowSize(width, height)
    setOpen(false)
  }

  const handleLogout = async () => {
    await signOut()
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

          <div style={{ height: '1px', background: 'var(--noir-border-dim)', margin: '6px 0', opacity: 0.5 }} />

          <button
            className="settings-preset-btn"
            style={{ color: 'var(--noir-red-bright)', letterSpacing: '0.1em' }}
            onClick={handleLogout}
          >
            SIGN OUT / LOCK
          </button>
        </div>
      )}
    </div>
  )
}
