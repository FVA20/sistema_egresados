import { useEffect, useState } from 'react'
import { getGraduates, deleteGraduate } from '../../api/graduates'
import { getPrograms } from '../../api/programs'
import type { Graduate, Program } from '../../types'
import GraduateModal from './GraduateModal'

const AVATAR_COLORS = ['#3b82f6','#10b981','#8b5cf6','#f43f5e','#f59e0b','#06b6d4']
const PAGE_SIZE = 10

export default function GraduatesPage() {
  const [graduates, setGraduates] = useState<Graduate[]>([])
  const [programs, setPrograms]   = useState<Program[]>([])
  const [search, setSearch]       = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected]   = useState<Graduate | null>(null)
  const [page, setPage]           = useState(1)

  const load = async () => {
    setLoading(true)
    const data = await getGraduates({
      search: search || undefined,
      program_id: programFilter ? Number(programFilter) : undefined,
      limit: 500,
    })
    setGraduates(data)
    setPage(1)
    setLoading(false)
  }

  useEffect(() => { getPrograms().then(setPrograms) }, [])
  useEffect(() => { load() }, [search, programFilter])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este egresado?')) return
    await deleteGraduate(id); load()
  }

  const getProgramName = (id: number) => programs.find(p => p.id === id)?.name ?? '—'

  const totalPages = Math.max(1, Math.ceil(graduates.length / PAGE_SIZE))
  const pageGraduates = graduates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages]
    if (page >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  const btnPage = (active: boolean): React.CSSProperties => ({
    minWidth: '36px', height: '36px', padding: '0 10px',
    border: active ? 'none' : '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '13px', fontWeight: active ? 700 : 500,
    background: active ? '#2563eb' : 'white', color: active ? 'white' : '#475569',
    cursor: 'pointer', transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ paddingLeft: '20px' }}>
          <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Egresados</h1>
          <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>
            {loading ? 'Cargando...' : `${graduates.length} egresado${graduates.length !== 1 ? 's' : ''} encontrado${graduates.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setModalOpen(true) }}
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95"
          style={{ gap: '10px', padding: '14px 28px', fontSize: '14px', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          Nuevo Egresado
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '20px 28px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="text" placeholder="Buscar por nombre, correo o documento..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={programFilter} onChange={e => setProgramFilter(e.target.value)}
          style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', color: '#475569', minWidth: '220px', outline: 'none' }}
        >
          <option value="">Todos los programas</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {(search || programFilter) && (
          <button
            onClick={() => { setSearch(''); setProgramFilter('') }}
            className="inline-flex items-center font-semibold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors"
            style={{ gap: '8px', padding: '12px 18px', fontSize: '14px', whiteSpace: 'nowrap' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400" style={{ fontSize: '14px' }}>Cargando egresados...</p>
          </div>
        ) : graduates.length === 0 ? (
          <div style={{ padding: '100px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="w-9 h-9 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
            </div>
            <p className="font-bold text-slate-700" style={{ fontSize: '17px' }}>No se encontraron egresados</p>
            <p className="text-slate-400" style={{ fontSize: '14px', maxWidth: '300px' }}>Intenta con otros filtros o registra un nuevo egresado</p>
            <button
              onClick={() => { setSelected(null); setModalOpen(true) }}
              className="inline-flex items-center bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              style={{ gap: '8px', padding: '12px 24px', fontSize: '14px', marginTop: '8px' }}
            >
              Registrar egresado
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {['#', 'Egresado', 'Programa', 'Año', 'Correo', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '18px 28px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageGraduates.map((g, i) => {
                  const rowNum = (page - 1) * PAGE_SIZE + i + 1
                  return (
                    <tr key={g.id} className="group hover:bg-slate-50 transition-colors" style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 28px', fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>{String(rowNum).padStart(2, '0')}</td>
                      <td style={{ padding: '20px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: AVATAR_COLORS[g.id % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                            {g.first_name[0]}{g.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900" style={{ fontSize: '14px' }}>{g.first_name} {g.last_name}</p>
                            <p className="text-slate-400" style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '3px' }}>{g.document_number}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 28px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 12px', borderRadius: '8px' }}>
                          {getProgramName(g.program_id)}
                        </span>
                      </td>
                      <td style={{ padding: '20px 28px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '5px 12px', borderRadius: '8px' }}>
                          {g.graduation_year}
                        </span>
                      </td>
                      <td style={{ padding: '20px 28px', fontSize: '14px', color: '#64748b' }}>{g.email}</td>
                      <td style={{ padding: '20px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => { setSelected(g); setModalOpen(true) }}
                            className="inline-flex items-center bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-lg transition-colors"
                            style={{ gap: '6px', padding: '8px 14px', fontSize: '12px' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="inline-flex items-center font-bold rounded-lg transition-all"
                            style={{ gap: '6px', padding: '8px 14px', fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#dc2626' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer con paginación */}
        {graduates.length > 0 && (
          <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p className="text-slate-500" style={{ fontSize: '13px' }}>
              Mostrando <strong className="text-slate-700">{(page - 1) * PAGE_SIZE + 1}</strong>–<strong className="text-slate-700">{Math.min(page * PAGE_SIZE, graduates.length)}</strong> de <strong className="text-slate-700">{graduates.length}</strong> egresados
            </p>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ ...btnPage(false), opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'default' : 'pointer' }}
                >
                  ←
                </button>
                {getPageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`el-${i}`} style={{ color: '#94a3b8', fontSize: '13px', padding: '0 2px' }}>…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p as number)} style={btnPage(page === p)}>
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ ...btnPage(false), opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <GraduateModal
          graduate={selected} programs={programs}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); load() }}
        />
      )}
    </div>
  )
}
