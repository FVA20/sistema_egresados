import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState<'info' | 'password'>('info')
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const saveInfo = async () => {
    setSaving(true); setMsg(null)
    try {
      const res = await apiClient.put('/auth/me', { username, email })
      updateUser(res.data)
      setMsg({ type: 'ok', text: 'Perfil actualizado correctamente' })
    } catch (e: any) {
      setMsg({ type: 'err', text: e.response?.data?.detail ?? 'Error al guardar' })
    } finally { setSaving(false) }
  }

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'err', text: 'Las contraseñas no coinciden' }); return
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'err', text: 'La contraseña debe tener al menos 6 caracteres' }); return
    }
    setSaving(true); setMsg(null)
    try {
      await apiClient.put('/auth/me', { current_password: currentPassword, new_password: newPassword })
      setMsg({ type: 'ok', text: 'Contraseña cambiada correctamente' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (e: any) {
      setMsg({ type: 'err', text: e.response?.data?.detail ?? 'Error al cambiar contraseña' })
    } finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', background: '#f8fafc', outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const labelStyle = { fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' as const }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '460px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)',
          padding: '28px 28px 20px', position: 'relative'
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: 'white',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: 0 }}>{user?.username}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '4px 0 0', textTransform: 'capitalize' }}>
                {user?.role === 'admin' ? 'Administrador' : 'Visualizador'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '2px 0 0' }}>
                Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' }) : '—'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {(['info', 'password'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setMsg(null) }} style={{
                padding: '7px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                background: tab === t ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: tab === t ? 'white' : 'rgba(255,255,255,0.6)',
              }}>
                {t === 'info' ? 'Mi Perfil' : 'Contraseña'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {msg && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: 500,
              background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2',
              color: msg.type === 'ok' ? '#16a34a' : '#dc2626',
              border: `1px solid ${msg.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
            }}>{msg.text}</div>
          )}

          {tab === 'info' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre de usuario</label>
                <input style={inputStyle} value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <input style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b' }}
                  value={user?.role === 'admin' ? 'Administrador' : 'Visualizador'} readOnly />
              </div>
              <button onClick={saveInfo} disabled={saving} style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: saving ? '#93c5fd' : '#2563eb', color: 'white', fontWeight: 700, fontSize: '15px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)', transition: 'all 0.2s',
              }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Contraseña actual</label>
                <input style={inputStyle} type="password" placeholder="••••••••"
                  value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <input style={inputStyle} type="password" placeholder="••••••••"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <input style={inputStyle} type="password" placeholder="••••••••"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <button onClick={savePassword} disabled={saving} style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: saving ? '#93c5fd' : '#2563eb', color: 'white', fontWeight: 700, fontSize: '15px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)', transition: 'all 0.2s',
              }}>
                {saving ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MainLayout() {
  const { isAuthenticated, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-slate-100">

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}

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
          {isMobile && (
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
          )}

          {/* Right side — clic abre perfil */}
          <button
            onClick={() => setProfileOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto',
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
              borderRadius: '14px', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            title="Ver perfil"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800 leading-none">{user?.username}</p>
              <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Visualizador'}</p>
            </div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 700, color: 'white',
              boxShadow: '0 4px 10px rgba(37,99,235,0.35)',
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 py-4 px-6 sm:py-6 sm:px-10 lg:py-10 lg:px-14 overflow-auto w-full">
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
