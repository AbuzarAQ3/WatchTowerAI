import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'
import TopBar from '../TopBar'
import './AppLayout.css'

export function ModuleLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: 'var(--clr-text-primary, #e2e8f0)',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(245, 158, 11, 0.2)',
          borderTopColor: 'var(--clr-amber, #f59e0b)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <span
        style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'var(--clr-text-secondary, #94a3b8)',
        }}
      >
        INITIALIZING SECURITY SESSION...
      </span>
    </div>
  )
}

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Suspense fallback={<ModuleLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
