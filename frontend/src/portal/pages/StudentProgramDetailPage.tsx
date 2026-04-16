import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorkPlansByProgram, getPrograms, getMyPostulations, createPostulation } from '../api/student'

interface WorkPlan {
  id: number
  title: string
  description: string | null
  content: string | null
  program_id: number
  is_active: boolean
  created_at: string
  file_name: string | null
  file_path: string | null
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return { color: '#dc2626', bg: '#fef2f2', label: 'PDF' }
  if (['doc','docx'].includes(ext)) return { color: '#00aae4', bg: '#f0fbff', label: 'Word' }
  if (['png','jpg','jpeg','gif'].includes(ext)) return { color: '#7c3aed', bg: '#f5f3ff', label: 'IMG' }
  if (['mp4','mov','avi','webm'].includes(ext)) return { color: '#059669', bg: '#ecfdf5', label: 'VID' }
  return { color: '#64748b', bg: '#f8fafc', label: 'FILE' }
}

export default function StudentProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([])
  const [programName, setProgramName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Postulaciones del egresado
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())

  // Modal de postulación
  const [modalPlan, setModalPlan] = useState<WorkPlan | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successId, setSuccessId] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    const programId = parseInt(id, 10)
    Promise.all([
      getWorkPlansByProgram(programId),
      getPrograms(),
      getMyPostulations(),
    ])
      .then(([plans, programs, myPostulations]) => {
        setWorkPlans(plans)
        const prog = programs.find(p => p.id === programId)
        if (prog) setProgramName(prog.name)
        setAppliedIds(new Set(myPostulations.map(p => p.workplan_id)))
      })
      .catch(() => setError('No se pudieron cargar los planes de trabajo.'))
      .finally(() => setLoading(false))
  }, [id])

  const openModal = (plan: WorkPlan) => {
    setModalPlan(plan)
    setMessage('')
  }

  const closeModal = () => {
    setModalPlan(null)
    setMessage('')
  }

  const handlePostulate = async () => {
    if (!modalPlan) return
    setSubmitting(true)
    try {
      await createPostulation(modalPlan.id, message || undefined)
      setAppliedIds(prev => new Set([...prev, modalPlan.id]))
      setSuccessId(modalPlan.id)
      closeModal()
      setTimeout(() => setSuccessId(null), 3000)
    } catch {
      // Ya postulado u otro error — se maneja silenciosamente
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/portal/programas')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '9px 18px', fontSize: '14px', fontWeight: 600, color: '#475569',
          cursor: 'pointer', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Programas
      </button>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #00aae4 0%, #006fa0 100%)', borderRadius: '20px', padding: '40px 48px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '26px', height: '26px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Planes de Trabajo</p>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.2 }}>{programName || 'Cargando...'}</h1>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#00aae4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '16px 20px', borderRadius: '12px' }}>
          {error}
        </div>
      )}

      {!loading && !error && workPlans.length === 0 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>No hay planes disponibles</h3>
          <p style={{ color: '#94a3b8', margin: 0 }}>No hay planes de trabajo disponibles para este programa aún.</p>
        </div>
      )}

      {/* Toast de éxito */}
      {successId !== null && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#059669', color: 'white', padding: '14px 28px', borderRadius: '14px',
          fontWeight: 700, fontSize: '14px', boxShadow: '0 8px 24px rgba(5,150,105,0.4)',
          zIndex: 300, display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          ¡Postulación enviada correctamente!
        </div>
      )}

      {!loading && !error && workPlans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {workPlans.map((plan, i) => {
            const applied = appliedIds.has(plan.id)
            return (
              <div
                key={plan.id}
                style={{ background: 'white', border: `1px solid ${applied ? '#a7f3d0' : '#e2e8f0'}`, borderRadius: '20px', padding: '32px 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'border-color 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#f0fbff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#00aae4', fontSize: '16px', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{plan.title}</h3>
                      {plan.is_active && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Activo
                        </span>
                      )}
                      {applied && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '100px' }}>
                          ✓ Postulado
                        </span>
                      )}
                    </div>

                    {plan.description && (
                      <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>{plan.description}</p>
                    )}
                    {plan.content && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', fontSize: '14px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: plan.file_name ? '16px' : '0' }}>
                        {plan.content}
                      </div>
                    )}
                    {plan.file_name && plan.file_path && (() => {
                      const fi = fileIcon(plan.file_name)
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: fi.bg, border: `1px solid ${fi.color}22`, borderRadius: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '36px', height: '36px', background: fi.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: 'white', letterSpacing: '0.03em' }}>{fi.label}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.file_name}</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Archivo adjunto</p>
                          </div>
                          <a
                            href={`/uploads/${plan.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: fi.color, borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: 'white', textDecoration: 'none', flexShrink: 0 }}
                          >
                            <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Descargar
                          </a>
                        </div>
                      )
                    })()}

                    {/* Botón Postular */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      {applied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>
                          Ya postulaste
                        </div>
                      ) : (
                        <button
                          onClick={() => openModal(plan)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '11px 24px', background: '#00aae4', color: 'white',
                            fontWeight: 700, fontSize: '14px', border: 'none',
                            borderRadius: '12px', cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(0,170,228,0.35)',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#006fa0'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#00aae4'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                        >
                          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                          </svg>
                          Postular
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de postulación */}
      {modalPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '460px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>

            {/* Header modal */}
            <div style={{ background: 'linear-gradient(135deg, #00aae4, #006fa0)', padding: '28px 32px' }}>
              <button
                onClick={closeModal}
                style={{ position: 'absolute', top: '0', right: '0', marginTop: '16px', marginRight: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Postulando a</p>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.3 }}>{modalPlan.title}</h2>
            </div>

            {/* Body modal */}
            <div style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                Al postular, el administrador será notificado y podrá contactarte. Puedes agregar un mensaje opcional.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Mensaje (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Ej: Estoy interesado en esta oportunidad..."
                  maxLength={500}
                  rows={3}
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#334155', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#f8fafc' }}
                />
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0', textAlign: 'right' }}>{message.length}/500</p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={closeModal}
                  style={{ flex: 1, padding: '13px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePostulate}
                  disabled={submitting}
                  style={{ flex: 2, padding: '13px', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#00aae4', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, boxShadow: '0 4px 14px rgba(0,170,228,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {submitting ? (
                    <>
                      <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                      Confirmar Postulación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
