import { ReactNode, useCallback } from 'react'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  // Click-through: when mouse is over transparent gap, pass click to window below.
  // When over real content, receive clicks normally.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    // If the element under the cursor is the app-shell itself (transparent bg), enable pass-through
    const isTransparent = !el || el.classList.contains('app-shell') || el.classList.contains('app-body') || el.classList.contains('layout-root')
    window.api.setIgnoreMouseEvents(isTransparent)
  }, [])

  return (
    <div className="app-shell" onMouseMove={handleMouseMove}>
      <div className="app-body">{children}</div>
    </div>
  )
}
