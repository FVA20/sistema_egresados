import { useEffect, useState } from 'react'
import api from '../../api/client'
import { getGraduates, deleteGraduate } from '../../api/graduates'
import type { User, Graduate, Program } from '../../types'

const ROLE_CONFIG: Record<string, { label: string; badgeColor: string; badgeBg: string; badgeBorder: string; gradient: string }> = {
  admin:  { label: 'Administrador', badgeColor: '#6d28d9', badgeBg: '#f5f3ff', badgeBorder: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  viewer: { label: 'Visualizador',  badgeColor: '#475569', badgeBg: '#f8fafc', badgeBorder: '#e2e8f0', gradient: 'linear-gradient(135deg,#64748b,#334155)' },
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }

export default function UsersPage() {
  const [tab, setTab]               = useState<'admin' | 'graduates'>('admin')
  const [users, setUsers]           = useState<User[]>([])
  const [graduates, setGraduates]   = useState<Graduate[]>([])
  const [programs, setPrograms]     = useState<Program[]>([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState({ username: '', email: '', password: '', role: 'viewer' })
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [search, setSearch]         = useState('')
  const [onlineIds, setOnlineIds]   = useState<Set<number>>(new Set())

  const loadOnline = () => {
    api.get('/portal/active-graduates').then(r => {
      setOnlineIds(new Set(r.data.filter((x: any) => x.online).map((x: any) => x.id)))
    }).catch(() => {})
  }

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/users/').then(r => setUsers(r.data)),
      getGraduates({ limit: 200 }).then(data => setGraduates(data)),
      api.get('/programs/').then(r => setPrograms(r.data)),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    loadOnline()
    const interval = setInterval(loadOnline, 30000)
    return () => clearInterval(interval)
  }, [])

  const openModal = () => { setForm({ username: '', email: '', password: '', role: 'viewer' }); setError(''); setShowPass(false); setShowModal(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    try { await api.post('/users/', form); setShowModal(false); load() }
    catch (err: any) { setError(err.response?.data?.detail ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    await api.delete(`/users/${id}`); load()
  }

  const handleDeleteGraduate = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar al egresado "${name}" del portal? También se eliminarán sus registros laborales.`)) return
    await deleteGraduate(id); load()
  }

  const getProgramName = (program_id: number) =>
    programs.find(p => p.id === program_id)?.name ?? 'Sin programa'

  const filteredGraduates = graduates.filter(g => {
    const q = search.toLowerCase()
    return (
      g.first_name.toLowerCase().includes(q) ||
      g.last_name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.document_number.toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      <style>{`
        .users-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
        .users-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .graduates-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        @media (max-width: 900px) {
          .users-stats-grid { grid-template-columns: repeat(2,1fr); }
          .users-cards-grid { grid-template-columns: repeat(2,1fr); }
          .graduates-cards-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 560px) {
          .users-stats-grid { grid-template-columns: repeat(2,1fr); }
          .users-cards-grid { grid-template-columns: 1fr; }
          .graduates-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ paddingLeft: '20px' }}>
          <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Usuarios</h1>
          <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>Gestión de accesos al sistema</p>
        </div>
        {tab === 'admin' && (
          <button onClick={openModal} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95"
            style={{ gap: '10px', padding: '14px 28px', fontSize: '14px', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '16px', width: 'fit-content' }}>
        {[
          { key: 'admin',     label: 'Panel Administrativo', icon: '👑' },
          { key: 'graduates', label: 'Portal Egresados',     icon: '🎓' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'admin' | 'graduates')}
            style={{
              padding: '10px 22px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? '#1d4ed8' : '#64748b',
              boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <span>{t.icon}</span> {t.label}
            <span style={{
              background: tab === t.key ? '#eff6ff' : '#e2e8f0',
              color: tab === t.key ? '#1d4ed8' : '#64748b',
              fontSize: '12px',
              fontWeight: 800,
              padding: '2px 9px',
              borderRadius: '99px',
            }}>
              {t.key === 'admin' ? users.length : graduates.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ──── TAB: PANEL ADMIN ──── */}
          {tab === 'admin' && (
            <>
              {/* Resumen */}
              {users.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '28px 36px' }}>
                  <div className="users-stats-grid">
                    {[
                      { label: 'Total de usuarios',  val: users.length,                                 color: '#0f172a', bg: '#f8fafc' },
                      { label: 'Administradores',    val: users.filter(u => u.role === 'admin').length,  color: '#6d28d9', bg: '#f5f3ff' },
                      { label: 'Visualizadores',     val: users.filter(u => u.role === 'viewer').length, color: '#334155', bg: '#f8fafc' },
                      { label: 'Cuentas activas',    val: users.filter(u => u.is_active).length,         color: '#059669', bg: '#ecfdf5' },
                    ].map(s => (
                      <div key={s.label} style={{ background: s.bg, borderRadius: '16px', padding: '20px 24px' }}>
                        <p style={{ fontSize: '40px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</p>
                        <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '8px' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {users.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <p className="font-bold text-slate-700" style={{ fontSize: '17px' }}>Sin usuarios registrados</p>
                  <button onClick={openModal} className="inline-flex items-center bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                    style={{ gap: '8px', padding: '13px 24px', fontSize: '14px', marginTop: '8px' }}>Crear usuario</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: '24px' }}>
                  {users.map(u => {
                    const rc = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.viewer
                    return (
                      <div key={u.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                        <div style={{ background: rc.gradient, padding: '28px 32px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px', flexShrink: 0 }}>
                              {u.username[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p style={{ fontWeight: 700, color: 'white', fontSize: '17px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</p>
                              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: '22px 32px 28px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '99px', border: `1px solid ${rc.badgeBorder}`, background: rc.badgeBg, color: rc.badgeColor }}>
                              {u.role === 'admin' ? '👑' : '👁'} {rc.label}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '99px', border: `1px solid ${u.is_active ? '#a7f3d0' : '#fecaca'}`, background: u.is_active ? '#ecfdf5' : '#fef2f2', color: u.is_active ? '#059669' : '#dc2626' }}>
                              {u.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-slate-400" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '20px' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            Creado el {new Date(u.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <button onClick={() => handleDelete(u.id)}
                            style={{ width: '100%', padding: '11px', fontSize: '13px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#dc2626' }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Eliminar usuario
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ──── TAB: PORTAL EGRESADOS ──── */}
          {tab === 'graduates' && (
            <>
              {/* Info de acceso */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '18px 24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <svg style={{ width: '20px', height: '20px', color: '#2563eb', flexShrink: 0, marginTop: '1px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '14px' }}>Acceso al Portal</p>
                  <p style={{ color: '#3b82f6', fontSize: '13px', marginTop: '2px' }}>
                    Cada egresado inicia sesión en <strong>/portal/login</strong> usando su <strong>correo o N° DNI</strong> como usuario y sus <strong>apellidos</strong> como contraseña.
                  </p>
                </div>
              </div>

              {/* Buscador */}
              <div style={{ position: 'relative', maxWidth: '400px' }}>
                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, DNI o correo..."
                  style={{ ...inputStyle, paddingLeft: '42px' }}
                />
              </div>

              {filteredGraduates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '80px 40px', textAlign: 'center' }}>
                  <p className="font-bold text-slate-500" style={{ fontSize: '16px' }}>
                    {search ? 'No se encontraron resultados.' : 'No hay egresados registrados.'}
                  </p>
                  <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '8px' }}>
                    Registra egresados desde la sección <strong>Egresados</strong>.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: '24px' }}>
                  {filteredGraduates.map(g => (
                    <div key={g.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                      {/* Cabecera */}
                      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '24px 28px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '18px', flexShrink: 0 }}>
                            {g.first_name[0].toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontWeight: 700, color: 'white', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {g.first_name} {g.last_name}
                            </p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {g.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Programa */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg style={{ width: '15px', height: '15px', color: '#2563eb', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                          </svg>
                          <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getProgramName(g.program_id)}
                          </span>
                        </div>

                        {/* DNI */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg style={{ width: '15px', height: '15px', color: '#64748b', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                          </svg>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>DNI: {g.document_number}</span>
                        </div>

                        {/* Año de egreso */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg style={{ width: '15px', height: '15px', color: '#64748b', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>Egresado en {g.graduation_year}</span>
                        </div>

                        {/* Credenciales de acceso */}
                        <div style={{ marginTop: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Acceso al portal</p>
                          <p style={{ fontSize: '12px', color: '#475569' }}>
                            <span style={{ fontWeight: 600 }}>Usuario:</span> {g.email} o {g.document_number}
                          </p>
                          <p style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
                            <span style={{ fontWeight: 600 }}>Contraseña:</span> sus apellidos
                          </p>
                        </div>

                        {/* Badge en línea / desconectado */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '99px', width: 'fit-content',
                          border: onlineIds.has(g.id) ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                          background: onlineIds.has(g.id) ? '#ecfdf5' : '#f8fafc',
                          color: onlineIds.has(g.id) ? '#059669' : '#94a3b8',
                        }}>
                          <span style={{
                            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                            background: onlineIds.has(g.id) ? '#22c55e' : '#cbd5e1',
                            boxShadow: onlineIds.has(g.id) ? '0 0 0 2px #bbf7d0' : 'none',
                          }} />
                          {onlineIds.has(g.id) ? 'En línea' : 'Desconectado'}
                        </span>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleDeleteGraduate(g.id, `${g.first_name} ${g.last_name}`)}
                          style={{ marginTop: '4px', width: '100%', padding: '10px', fontSize: '13px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#ef4444' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca' }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          Eliminar egresado
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal nuevo usuario admin */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full" style={{ maxWidth: '520px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 className="font-bold text-slate-900" style={{ fontSize: '18px' }}>Nuevo Usuario</h2>
                <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>Configura el acceso al panel</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl p-2.5 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { key: 'username', type: 'text',  label: 'Nombre de usuario',  placeholder: 'Ej: admin_juan' },
                { key: 'email',    type: 'email', label: 'Correo electrónico', placeholder: 'correo@ejemplo.com' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Mínimo 6 caracteres" style={{ ...inputStyle, paddingRight: '48px' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Rol del usuario</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { val: 'admin',  icon: '👑', label: 'Administrador', sub: 'Acceso completo al sistema' },
                    { val: 'viewer', icon: '👁',  label: 'Visualizador',  sub: 'Solo puede consultar datos' },
                  ].map(r => (
                    <button key={r.val} type="button" onClick={() => setForm({ ...form, role: r.val })}
                      style={{ padding: '18px 16px', borderRadius: '14px', border: `2px solid ${form.role === r.val ? '#3b82f6' : '#e2e8f0'}`, background: form.role === r.val ? '#eff6ff' : 'white', textAlign: 'left', cursor: 'pointer' }}>
                      <span style={{ fontSize: '22px', display: 'block', marginBottom: '10px' }}>{r.icon}</span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: form.role === r.val ? '#1d4ed8' : '#0f172a' }}>{r.label}</p>
                      <p style={{ fontSize: '12px', marginTop: '4px', color: form.role === r.val ? '#3b82f6' : '#94a3b8' }}>{r.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '13px 16px', borderRadius: '12px', fontSize: '14px' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
