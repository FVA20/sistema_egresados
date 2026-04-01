import { useEffect, useState } from 'react'
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../../api/programs'
import type { Program } from '../../types'

const LEVEL_COLORS: Record<string, { badge: string; badgeBg: string; badgeBorder: string; gradient: string }> = {
  'Bachiller':    { badge: '#1d4ed8', badgeBg: '#eff6ff', badgeBorder: '#bfdbfe', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  'Licenciatura': { badge: '#6d28d9', badgeBg: '#f5f3ff', badgeBorder: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  'Técnico':      { badge: '#b45309', badgeBg: '#fffbeb', badgeBorder: '#fde68a', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)' },
  'Maestría':     { badge: '#065f46', badgeBg: '#ecfdf5', badgeBorder: '#a7f3d0', gradient: 'linear-gradient(135deg,#10b981,#065f46)' },
}
const CARD_BORDERS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4']

const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState<Program | null>(null)
  const [form, setForm] = useState({ name: '', faculty: '', degree_level: 'Bachiller', duration_years: 5, active: true })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); getPrograms().then(setPrograms).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openNew  = () => { setSelected(null); setForm({ name: '', faculty: '', degree_level: 'Bachiller', duration_years: 5, active: true }); setError(''); setShowModal(true) }
  const openEdit = (p: Program) => { setSelected(p); setForm({ name: p.name, faculty: p.faculty, degree_level: p.degree_level, duration_years: p.duration_years, active: p.active }); setError(''); setShowModal(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    try { selected ? await updateProgram(selected.id, form) : await createProgram(form); setShowModal(false); load() }
    catch (err: any) { setError(err.response?.data?.detail ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este programa?')) return
    await deleteProgram(id); load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Programas de Estudio</h1>
          <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>
            {loading ? 'Cargando...' : `${programs.length} programa${programs.length !== 1 ? 's' : ''} registrado${programs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={openNew} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95"
          style={{ gap: '10px', padding: '14px 28px', fontSize: '14px', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          Nuevo Programa
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '72px', height: '72px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="w-9 h-9 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <p className="font-bold text-slate-700" style={{ fontSize: '17px' }}>No hay programas registrados</p>
          <p className="text-slate-400" style={{ fontSize: '14px' }}>Crea el primer programa de estudio</p>
          <button onClick={openNew} className="inline-flex items-center bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            style={{ gap: '8px', padding: '13px 24px', fontSize: '14px', marginTop: '8px' }}>
            Agregar programa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: '24px' }}>
          {programs.map((p, i) => {
            const lvl = LEVEL_COLORS[p.degree_level] ?? LEVEL_COLORS['Bachiller']
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
                style={{ borderLeft: `4px solid ${CARD_BORDERS[i % CARD_BORDERS.length]}` }}>
                <div style={{ padding: '32px 32px 28px', flex: 1 }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: lvl.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '99px', border: `1px solid ${p.active ? '#a7f3d0' : '#e2e8f0'}`, background: p.active ? '#ecfdf5' : '#f8fafc', color: p.active ? '#059669' : '#64748b' }}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900" style={{ fontSize: '18px', lineHeight: 1.3, marginBottom: '6px' }}>{p.name}</h3>
                  <p className="text-slate-500" style={{ fontSize: '14px', marginBottom: '24px' }}>{p.faculty}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', border: `1px solid ${lvl.badgeBorder}`, background: lvl.badgeBg, color: lvl.badge }}>{p.degree_level}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}>{p.duration_years} años</span>
                  </div>
                </div>
                <div style={{ padding: '16px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    style={{ gap: '8px', padding: '11px', fontSize: '13px' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Editar
                  </button>
                  <div style={{ width: '1px', background: '#f1f5f9' }} />
                  <button onClick={() => handleDelete(p.id)} className="flex-1 flex items-center justify-center font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    style={{ gap: '8px', padding: '11px', fontSize: '13px' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full" style={{ maxWidth: '520px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 className="font-bold text-slate-900" style={{ fontSize: '18px' }}>{selected ? 'Editar Programa' : 'Nuevo Programa'}</h2>
                <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>Datos del programa de estudio</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl p-2.5 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ ...inputStyle, display: 'block', padding: 0, border: 'none', background: 'none', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Nombre del Programa</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Ingeniería de Sistemas" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Facultad</label>
                <input value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} required placeholder="Ej: Facultad de Ingeniería" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Nivel Académico</label>
                  <select value={form.degree_level} onChange={e => setForm({ ...form, degree_level: e.target.value })} style={inputStyle}>
                    <option>Bachiller</option><option>Licenciatura</option><option>Técnico</option><option>Maestría</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Duración (años)</label>
                  <input type="number" min={1} max={10} value={form.duration_years} onChange={e => setForm({ ...form, duration_years: Number(e.target.value) })} style={inputStyle} />
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
                  {saving ? 'Guardando...' : selected ? 'Actualizar' : 'Crear Programa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
