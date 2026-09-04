import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AuthGate from './components/AuthGate'
import TrayApp from './components/TrayApp'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

if (window.location.hash === '#/tray') {
  document.body.style.background = 'transparent'
  root.render(
    <React.StrictMode>
      <TrayApp />
    </React.StrictMode>
  )
} else {
  root.render(
    <React.StrictMode>
      <AuthGate>
        <App />
      </AuthGate>
    </React.StrictMode>
  )
}
