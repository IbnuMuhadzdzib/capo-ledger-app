import { ReactNode, useCallback, useEffect, useState } from 'react'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const w = document.documentElement.clientWidth
      const h = document.documentElement.clientHeight
      const scaleW = w / 1450
      const scaleH = h / 870
      setScale(Math.min(scaleW, scaleH, 1))
    }
    window.addEventListener('resize', updateScale)
    updateScale()
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Click-through: when mouse is over transparent gap, pass click to window below.
  // When over real content, receive clicks normally.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    // If the element under the cursor is the app-shell itself (transparent bg), enable pass-through
    const isTransparent = !el || el.classList.contains('app-shell') || el.classList.contains('app-body') || el.classList.contains('layout-root')
    window.api.setIgnoreMouseEvents(isTransparent)
  }, [])

  return (
    <div className="app-shell" onMouseMove={handleMouseMove} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="app-body" style={{ transform: `scale(${scale})`, transformOrigin: 'center center', width: 1450, height: 870, flex: 'none' }}>{children}</div>
    </div>
  )
}
