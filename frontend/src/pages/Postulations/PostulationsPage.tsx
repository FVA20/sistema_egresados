import { useEffect, useState } from 'react'
import apiClient from '../../api/client'

interface Postulation {
  id: number
  graduate_id: number
  graduate_name: string
  graduate_email: string
  workplan_id: number
  workplan_title: string
  message: string | null
  status: 'pendiente' | 'visto' | 'contactado'
  created_at: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pendiente:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pendiente' },
  visto:      { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Visto' },
  contactado: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', label: 'Contactado' },
}

export default function PostulationsPage() {
  const [postulations, setPostulations] = useState<Postulation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'visto' | 'contactado'>('todos')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchPostulations = () => {
    apiClient.get('/postulations/')
      .then(res => setPostulations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPostulations() }, [])

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      await apiClient.put(`/postulations/${id}/status`, { status })
      setPostulations(prev => prev.map(p => p.id === id ? { ...p, status: status as Postulation['status'] } : p))
    } catch {}
    setUpdatingId(null)
  }

  const contactByGmail = async (p: Postulation) => {
    const subject = `Oportunidad Laboral — ${p.workplan_title} | IESTP Enrique López Albújar`
    const body = `Estimado/a ${p.graduate_name},\n\nNos complace informarle que ha sido seleccionado/a para presentarse al plan de trabajo:\n\n📋 ${p.workplan_title}\n\nLe invitamos a acercarse a las instalaciones del instituto o comunicarse con nosotros para coordinar los detalles.\n\nAtentamente,\nÁrea de Secretaría Académica\nIESTP Enrique López Albújar`
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(p.graduate_email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(`https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(gmailUrl)}`, '_blank')
    if (p.status !== 'contactado') await updateStatus(p.id, 'contactado')
  }

  const filtered = postulations.filter(p => filter === 'todos' || p.status === filter)
  const pendingCount = postulations.filter(p => p.status === 'pendiente').length

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        /* Stats */
        .post-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
        .post-stat  { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .post-stat-lbl { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 6px; }
        .post-stat-val { font-size: 28px; font-weight: 900; margin: 0; }

        /* Filters */
        .post-filters { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px; }
        .post-filters::-webkit-scrollbar { display: none; }

        /* Desktop table */
        .post-table-wrap { display: block; }
        .post-cards-wrap { display: none; }
        .post-table { width: 100%; border-collapse: collapse; }
        .post-table th, .post-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .post-table th { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; background: #f8fafc; }
        .post-table tr:last-child td { border-bottom: none; }
        .post-table tr:hover td { background: #fafbfc; }

        @media (max-width: 768px) {
          .post-stats  { grid-template-columns: repeat(3,1fr); gap: 8px; }
          .post-stat   { padding: 12px 10px; border-radius: 12px; }
          .post-stat-lbl { font-size: 9px; }
          .post-stat-val { font-size: 20px; }
          .post-table-wrap { display: none; }
          .post-cards-wrap { display: flex; flex-direction: column; gap: 12px; }
          .post-outer { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Postulaciones</h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Egresados que postularon a planes de trabajo</p>
      </div>

      {/* Stats */}
      <div className="post-stats">
        {[
          { label: 'Total',       value: postulations.length,                                         color: '#2563eb' },
          { label: 'Pendientes',  value: pendingCount,                                                color: '#d97706' },
          { label: 'Contactados', value: postulations.filter(p => p.status === 'contactado').length,  color: '#059669' },
        ].map((s, i) => (
          <div key={i} className="post-stat">
            <p className="post-stat-lbl">{s.label}</p>
            <p className="post-stat-val" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="post-filters">
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', flexShrink: 0 }}>Filtrar:</span>
        {(['todos', 'pendiente', 'visto', 'contactado'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 15px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
              border: filter === f ? 'none' : '1px solid #e2e8f0',
              background: filter === f ? '#2563eb' : 'white',
              color: filter === f ? 'white' : '#475569',
              cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            {f === 'todos' ? 'Todos' : STATUS_STYLES[f].label}
            {f === 'pendiente' && pendingCount > 0 && (
              <span style={{
                marginLeft: '5px', padding: '1px 6px', borderRadius: '99px', fontSize: '11px', fontWeight: 800,
                background: filter === f ? 'rgba(255,255,255,0.25)' : '#fde68a',
                color: filter === f ? 'white' : '#d97706',
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="post-outer" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#475569', margin: '0 0 6px' }}>No hay postulaciones</p>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
              {filter === 'todos' ? 'Aún no hay egresados que hayan postulado.' : `No hay postulaciones con estado "${STATUS_STYLES[filter]?.label}".`}
            </p>
          </div>
        ) : (
          <>
            {/* ── DESKTOP: tabla ── */}
            <div className="post-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="post-table">
                <thead>
                  <tr>
                    <th>Egresado</th>
                    <th>Plan de Trabajo</th>
                    <th>Mensaje</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Cambiar estado</th>
                    <th>Contactar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const s = STATUS_STYLES[p.status]
                    return (
                      <tr key={p.id}>
                        <td>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{p.graduate_name}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{p.graduate_email}</p>
                        </td>
                        <td>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.workplan_title}</p>
                        </td>
                        <td>
                          {p.message
                            ? <p style={{ fontSize: '13px', color: '#475569', margin: 0, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.message}>{p.message}</p>
                            : <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Sin mensaje</span>}
                        </td>
                        <td>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                            {new Date(p.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                            {s.label}
                          </span>
                        </td>
                        <td>
                          <select
                            value={p.status}
                            disabled={updatingId === p.id}
                            onChange={e => updateStatus(p.id, e.target.value)}
                            style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', background: '#f8fafc', color: '#334155', outline: 'none', cursor: 'pointer', opacity: updatingId === p.id ? 0.5 : 1 }}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="visto">Visto</option>
                            <option value="contactado">Contactado</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => contactByGmail(p)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: 'none', borderRadius: '10px', background: '#2563eb', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
                          >
                            <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Contactar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── MÓVIL: tarjetas ── */}
            <div className="post-cards-wrap">
              {filtered.map(p => {
                const s = STATUS_STYLES[p.status]
                return (
                  <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', background: '#fafbfc' }}>

                    {/* Fila 1: Nombre + Badge estado */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{p.graduate_name}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.graduate_email}</p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '5px 11px', borderRadius: '99px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, flexShrink: 0 }}>
                        {s.label}
                      </span>
                    </div>

                    {/* Plan de trabajo */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>Plan de trabajo</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0 }}>{p.workplan_title}</p>
                    </div>

                    {/* Mensaje + Fecha en fila */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>Mensaje</p>
                        <p style={{ fontSize: '12px', color: p.message ? '#475569' : '#cbd5e1', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.message ?? 'Sin mensaje'}
                        </p>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>Fecha</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                          {new Date(p.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>

                    {/* Acciones: select + botón */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={p.status}
                        disabled={updatingId === p.id}
                        onChange={e => updateStatus(p.id, e.target.value)}
                        style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'white', color: '#334155', outline: 'none', cursor: 'pointer', opacity: updatingId === p.id ? 0.5 : 1 }}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="visto">Visto</option>
                        <option value="contactado">Contactado</option>
                      </select>
                      <button
                        onClick={() => contactByGmail(p)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: 'none', borderRadius: '10px', background: '#2563eb', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)', flexShrink: 0 }}
                      >
                        <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Contactar
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
