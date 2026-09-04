import { useEffect } from 'react'
import '../tray.css'

export default function TrayApp() {
    const triggerAction = (action: string) => {
        window.api.sendTrayAction(action)
    }

    // Prevent right-click menu or specific default actions in tray
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault()
        window.addEventListener('contextmenu', handleContextMenu)
        return () => window.removeEventListener('contextmenu', handleContextMenu)
    }, [])

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100vh',
                background: '#2c2e33', // Custom distinct background like steam
                color: 'var(--noir-text-pri)',
                fontSize: '13px',
                padding: '6px 0',
                boxSizing: 'border-box',
                overflow: 'hidden',
                border: '1px solid var(--noir-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
        >
            <button className="tray-btn" onClick={() => triggerAction('show')}>
                Show Capo Ledger
            </button>

            <div className="tray-separator" />

            <button className="tray-btn" onClick={() => triggerAction('addIncome')}>
                Add Income
            </button>
            <button className="tray-btn" onClick={() => triggerAction('addAllocation')}>
                Add Allocation
            </button>

            <div className="tray-separator" />

            <button className="tray-btn logout" onClick={() => triggerAction('logout')}>
                Log Out
            </button>

            <div className="tray-separator" />

            <button className="tray-btn" onClick={() => triggerAction('quit')}>
                Exit
            </button>
        </div>
    )
}
