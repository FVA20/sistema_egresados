import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function MainLayout() {
  const { isAuthenticated, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Overlay para móvil cuando el sidebar está abierto */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center',
              width: '42px', height: '42px', borderRadius: '12px', border: '1px solid #e2e8f0',
              background: 'white', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
            }}
            title="Menú"
          >
            <span style={{ width: '16px', height: '2px', background: '#475569', borderRadius: '2px' }} />
            <span style={{ width: '12px', height: '2px', background: '#475569', borderRadius: '2px' }} />
            <span style={{ width: '16px', height: '2px', background: '#475569', borderRadius: '2px' }} />
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800 leading-none">{user?.username}</p>
              <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-4 py-3 text-xs text-slate-400 flex items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} IESTP Enrique López Albújar</span>
          <span className="hidden sm:block">Sistema de Egresados v1.0</span>
        </footer>
      </div>
    </div>
  )
}
