import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function MainLayout() {
  const { isAuthenticated, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          {/* Botón hamburguesa en topbar (visible cuando sidebar colapsado) */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center',
                width: '42px', height: '42px', borderRadius: '12px', border: '1px solid #e2e8f0',
                background: 'white', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
              title="Abrir menú"
            >
              <span style={{ width: '16px', height: '2px', background: '#475569', borderRadius: '2px' }} />
              <span style={{ width: '12px', height: '2px', background: '#475569', borderRadius: '2px' }} />
              <span style={{ width: '16px', height: '2px', background: '#475569', borderRadius: '2px' }} />
            </button>
          )}
          {sidebarOpen && <div />}
          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800 leading-none">{user?.username}</p>
              <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-base font-bold text-white shadow-md">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-12 overflow-auto w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-8 py-3 text-xs text-slate-400 flex items-center justify-between">
          <span>© {new Date().getFullYear()} IESTP Enrique López Albújar</span>
          <span>Sistema de Egresados v1.0</span>
        </footer>
      </div>
    </div>
  )
}
