import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Explicitly ensure the window receives all mouse events since the login screen is opaque
    useEffect(() => {
        if (window.api && (window as any).api.setIgnoreMouseEvents) {
            window.api.setIgnoreMouseEvents(false)
        }
    }, [])

    const handleMouseMove = () => {
        if (window.api && (window as any).api.setIgnoreMouseEvents) {
            window.api.setIgnoreMouseEvents(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                setError(error.message)
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
        .login-drag-root { -webkit-app-region: drag; }
        .login-no-drag { -webkit-app-region: no-drag; }
      `}</style>
            <div
                className="login-drag-root"
                onMouseMove={handleMouseMove}
                style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'var(--noir-dark)',
                    background: 'radial-gradient(circle at center, #1f1f1f 0%, #0c0c0c 100%)',
                    position: 'relative'
                }}
            >
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '40px', left: '40px', opacity: 0.1, pointerEvents: 'none' }}>
                    <div style={{ width: '100px', height: '1px', background: 'var(--noir-gold)' }} />
                    <div style={{ width: '1px', height: '100px', background: 'var(--noir-gold)' }} />
                </div>
                <div style={{ position: 'absolute', bottom: '40px', right: '40px', opacity: 0.1, pointerEvents: 'none' }}>
                    <div style={{ width: '100px', height: '1px', background: 'var(--noir-gold)', position: 'absolute', right: 0, bottom: 0 }} />
                    <div style={{ width: '1px', height: '100px', background: 'var(--noir-gold)', position: 'absolute', right: 0, bottom: 0 }} />
                </div>

                <form
                    onSubmit={handleLogin}
                    className="login-no-drag"
                    style={{
                        width: '380px',
                        padding: '40px 32px',
                        background: 'var(--noir-card)',
                        borderRadius: '2px', // Sharper corners for Noir look
                        border: '1px solid var(--noir-border-dim)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(201,161,59,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        position: 'relative',
                        zIndex: 10
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            color: 'var(--noir-gold)',
                            fontSize: '26px',
                            letterSpacing: '0.2em',
                            margin: 0,
                            textShadow: '0 2px 10px rgba(201,161,59,0.2)'
                        }}>CAPO LEDGER</h2>
                        <div style={{
                            height: '1px',
                            width: '40px',
                            background: 'var(--noir-gold)',
                            margin: '12px auto',
                            opacity: 0.5
                        }} />
                        <p style={{
                            fontFamily: 'var(--font-body)',
                            color: 'var(--noir-muted)',
                            fontSize: '9px',
                            letterSpacing: '0.15em',
                            margin: 0,
                            textTransform: 'uppercase'
                        }}>Restricted Financial Archive</p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(220, 53, 69, 0.1)',
                            borderLeft: '2px solid #dc3545',
                            color: '#dc3545',
                            fontSize: '12px',
                            fontFamily: 'var(--font-body)'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', color: 'var(--noir-muted)', marginBottom: '6px', letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>IDENTIFICATION (EMAIL)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="operator@syndicate.co"
                                className="form-input"
                                style={{ padding: '12px 14px', fontSize: '14px' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '10px', color: 'var(--noir-muted)', marginBottom: '6px', letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>CLEARANCE CODE</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="form-input"
                                style={{ padding: '12px 14px', fontSize: '14px', letterSpacing: '0.2em' }}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '14px 0',
                            fontSize: '12px',
                            letterSpacing: '0.15em',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
                                    <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                                </svg>
                                AUTHENTICATING...
                            </>
                        ) : 'ACCESS ARCHIVE'}
                    </button>
                </form>
            </div>
        </>
    )
}
