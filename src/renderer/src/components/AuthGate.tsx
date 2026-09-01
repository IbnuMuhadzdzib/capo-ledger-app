import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import LoginScreen from './LoginScreen'

interface AuthGateProps {
    children: React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
    const { session, isInitialized, initialize } = useAuthStore()

    useEffect(() => {
        initialize()
        // Ensure no click-through during the auth gate stage
        if (window.api && (window as any).api.setIgnoreMouseEvents) {
            window.api.setIgnoreMouseEvents(false)
        }
    }, [initialize])

    if (!isInitialized) {
        return (
            <>
                <style>{`.auth-gate-drag { -webkit-app-region: drag; }`}</style>
                <div
                    className="auth-gate-drag"
                    onMouseMove={() => window.api?.setIgnoreMouseEvents(false)}
                    style={{
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'var(--noir-dark)',
                        color: 'var(--noir-gold)',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '0.1em',
                        fontSize: '12px'
                    }}
                >
                    INITIALIZING ARCHIVE...
                </div>
            </>
        )
    }

    if (!session) {
        return <LoginScreen />
    }

    return <>{children}</>
}
