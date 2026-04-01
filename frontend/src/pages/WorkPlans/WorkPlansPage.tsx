import { useEffect, useRef, useState } from 'react'
import { getPrograms } from '../../api/programs'
import {
  getWorkPlansByProgram, createWorkPlan, updateWorkPlan,
  deleteWorkPlan, uploadWorkPlanFile, deleteWorkPlanFile,
} from '../../api/workplans'
import type { Program } from '../../types'
import type { WorkPlan, WorkPlanCreate } from '../../api/workplans'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', border: '1px solid #e2e8f0',
  borderRadius: '12px', fontSize: '14px', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
}
const CARD_BORDERS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4']
const ALLOWED_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi,.webm'

type FormState = { title: string; description: string; content: string; program_id: number; is_active: boolean }
const emptyForm = (programId: number): FormState => ({ title: '', description: '', content: '', program_id: programId, is_active: true })

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return { color: '#dc2626', bg: '#fef2f2', label: 'PDF' }
  if (['doc','docx'].includes(ext)) return { color: '#2563eb', bg: '#eff6ff', label: 'Word' }
  if (['png','jpg','jpeg','gif'].includes(ext)) return { color: '#7c3aed', bg: '#f5f3ff', label: 'IMG' }
  if (['mp4','mov','avi','webm'].includes(ext)) return { color: '#059669', bg: '#ecfdf5', label: 'VID' }
  return { color: '#64748b', bg: '#f8fafc', label: 'FILE' }
}

export default function WorkPlansPage() {
  const [programs, setPrograms]               = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [workPlans, setWorkPlans]             = useState<WorkPlan[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [loadingPlans, setLoadingPlans]       = useState(false)
  const [showModal, setShowModal]             = useState(false)
  const [editing, setEditing]                 = useState<WorkPlan | null>(null)
  const [form, setForm]                       = useState<FormState>(emptyForm(0))
  const [error, setError]                     = useState('')
  const [saving, setSaving]                   = useState(false)
  // archivo
  const [pendingFile, setPendingFile]         = useState<File | null>(null)
  const [uploadProgress, setUploadProgress]  = useState(false)
  const [fileError, setFileError]             = useState('')
  const fileInputRef                          = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getPrograms()
      .then(ps => {
        setPrograms(ps)
        if (ps.length > 0) selectProgram(ps[0], ps[0].id)
      })
      .finally(() => setLoadingPrograms(false))
  }, [])

  const selectProgram = (p: Program, id = p.id) => {
    setSelectedProgram(p)
    setLoadingPlans(true)
    getWorkPlansByProgram(id)
      .then(setWorkPlans)
      .finally(() => setLoadingPlans(false))
  }

  const openNew = () => {
    if (!selectedProgram) return
    setEditing(null)
    setForm(emptyForm(selectedProgram.id))
    setPendingFile(null)
    setError('')
    setFileError('')
    setShowModal(true)
  }

  const openEdit = (plan: WorkPlan) => {
    setEditing(plan)
    setForm({
      title: plan.title,
      description: plan.description ?? '',
      content: plan.content ?? '',
      program_id: plan.program_id,
      is_active: plan.is_active,
    })
    setPendingFile(null)
    setError('')
    setFileError('')
    setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setFileError('El archivo supera el límite de 50 MB.')
      return
    }
    setFileError('')
    setPendingFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload: WorkPlanCreate = {
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      program_id: form.program_id,
      is_active: form.is_active,
    }

    try {
      let saved: WorkPlan
      if (editing) {
        saved = await updateWorkPlan(editing.id, payload)
      } else {
        saved = await createWorkPlan(payload)
      }

      // subir archivo si se seleccionó uno
      if (pendingFile) {
        setUploadProgress(true)
        await uploadWorkPlanFile(saved.id, pendingFile)
        setUploadProgress(false)
      }

      setShowModal(false)
      if (selectedProgram) selectProgram(selectedProgram)
    } catch (err: any) {
      setUploadProgress(false)
      setError(err.response?.data?.detail ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFile = async (plan: WorkPlan) => {
    if (!confirm('¿Eliminar el archivo adjunto?')) return
    await deleteWorkPlanFile(plan.id)
    if (selectedProgram) selectProgram(selectedProgram)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este plan de trabajo?')) return
    await deleteWorkPlan(id)
    if (selectedProgram) selectProgram(selectedProgram)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div>
        <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Planes de Trabajo</h1>
        <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>
          Gestiona los planes de trabajo por programa de estudio
        </p>
      </div>

      {loadingPrograms ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px', alignItems: 'start' }}>

          {/* Panel izquierdo: programas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Programas
              </p>
            </div>
            <div style={{ padding: '8px' }}>
              {programs.map((p, i) => {
                const isActive = selectedProgram?.id === p.id
                return (
                  <button key={p.id} onClick={() => selectProgram(p)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: isActive ? '#eff6ff' : 'transparent', transition: 'background 0.15s', textAlign: 'left',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: CARD_BORDERS[i % CARD_BORDERS.length] }} />
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, color: isActive ? '#1d4ed8' : '#334155', lineHeight: 1.3, flex: 1 }}>
                      {p.name}
                    </span>
                    {isActive && (
                      <svg style={{ width: '16px', height: '16px', color: '#2563eb', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Panel derecho */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {selectedProgram && (
              <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                borderRadius: '20px', padding: '28px 36px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                    Programa seleccionado
                  </p>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: 0 }}>{selectedProgram.name}</h2>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1 }}>
                    {loadingPlans ? '…' : workPlans.length}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: '4px 0 0', fontWeight: 600 }}>
                    {workPlans.length === 1 ? 'plan' : 'planes'}
                  </p>
                </div>
              </div>
            )}

            {loadingPlans ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : workPlans.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '36px', height: '36px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <p className="font-bold text-slate-700" style={{ fontSize: '17px', margin: 0 }}>No hay planes de trabajo</p>
                <p className="text-slate-400" style={{ fontSize: '14px', margin: 0 }}>Crea el primer plan para este programa</p>
                <button onClick={openNew} className="inline-flex items-center bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  style={{ gap: '8px', padding: '13px 24px', fontSize: '14px', marginTop: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                  Crear plan de trabajo
                </button>
              </div>
            ) : (
              workPlans.map((plan, i) => {
                const fi = plan.file_name ? fileIcon(plan.file_name) : null
                return (
                  <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                    style={{ borderLeft: `4px solid ${CARD_BORDERS[i % CARD_BORDERS.length]}` }}>
                    <div style={{ padding: '28px 32px' }}>
                      {/* Cabecera del plan */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2563eb', fontSize: '16px', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{plan.title}</h3>
                            <span style={{
                              fontSize: '11px', fontWeight: 700,
                              color: plan.is_active ? '#059669' : '#64748b',
                              background: plan.is_active ? '#ecfdf5' : '#f8fafc',
                              border: `1px solid ${plan.is_active ? '#a7f3d0' : '#e2e8f0'}`,
                              padding: '3px 10px', borderRadius: '100px',
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                              {plan.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button onClick={() => openEdit(plan)} className="flex items-center font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            style={{ gap: '6px', padding: '9px 14px', fontSize: '13px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Editar
                          </button>
                          <button onClick={() => handleDelete(plan.id)} className="flex items-center font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            style={{ gap: '6px', padding: '9px 14px', fontSize: '13px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {plan.description && (
                        <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: '0 0 16px', paddingLeft: '54px' }}>
                          {plan.description}
                        </p>
                      )}

                      {plan.content && (
                        <div style={{ marginLeft: '54px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 22px', fontSize: '13px', color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                          {plan.content}
                        </div>
                      )}

                      {/* Archivo adjunto */}
                      {fi && plan.file_name && plan.file_path && (
                        <div style={{
                          marginLeft: '54px', display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', background: fi.bg, border: `1px solid ${fi.color}22`,
                          borderRadius: '12px',
                        }}>
                          <div style={{ width: '36px', height: '36px', background: fi.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: 'white', letterSpacing: '0.03em' }}>{fi.label}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {plan.file_name}
                            </p>
                            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Archivo adjunto</p>
                          </div>
                          <a
                            href={`/uploads/${plan.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'white', border: `1px solid ${fi.color}55`, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: fi.color, textDecoration: 'none', flexShrink: 0 }}
                          >
                            <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Descargar
                          </a>
                          <button onClick={() => handleDeleteFile(plan)} title="Quitar archivo"
                            style={{ display: 'inline-flex', alignItems: 'center', padding: '7px', background: 'white', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}>
                            <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full" style={{ maxWidth: '620px', overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 32px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editing ? 'Editar Plan de Trabajo' : 'Nuevo Plan de Trabajo'}
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '3px 0 0' }}>{selectedProgram?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px', borderRadius: '10px' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

              <div>
                <label style={labelStyle}>Título del Plan *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  placeholder="Ej: Plan de Trabajo Anual 2025" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Programa</label>
                <select value={form.program_id} onChange={e => setForm({ ...form, program_id: Number(e.target.value) })} style={inputStyle}>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descripción del plan..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              <div>
                <label style={labelStyle}>Contenido</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Detalla actividades, objetivos, metas..." rows={5}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              {/* ── Subir archivo ── */}
              <div>
                <label style={labelStyle}>Archivo adjunto</label>

                {/* Si ya tiene archivo y no se está reemplazando */}
                {editing?.file_name && !pendingFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: fileIcon(editing.file_name).color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '8px', fontWeight: 900, color: 'white' }}>{fileIcon(editing.file_name).label}</span>
                    </div>
                    <p style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {editing.file_name}
                    </p>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}>
                      Reemplazar
                    </button>
                  </div>
                )}

                {/* Archivo nuevo seleccionado (pendiente) */}
                {pendingFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '8px', fontWeight: 900, color: 'white' }}>{fileIcon(pendingFile.name).label}</span>
                    </div>
                    <p style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#1d4ed8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pendingFile.name}
                    </p>
                    <span style={{ fontSize: '11px', color: '#60a5fa', flexShrink: 0 }}>
                      {(pendingFile.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button type="button" onClick={() => { setPendingFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', padding: '2px' }}>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )}

                {/* Zona de drop / botón */}
                {!pendingFile && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '28px 20px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                      cursor: 'pointer', background: '#f8fafc', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#93c5fd')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                  >
                    <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: '22px', height: '22px', color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0 }}>Haz clic para subir un archivo</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>PDF, Word, imágenes o videos · Máx. 50 MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {fileError && (
                  <p style={{ fontSize: '13px', color: '#dc2626', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    {fileError}
                  </p>
                )}
              </div>

              {/* Toggle activo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })} style={{
                  width: '44px', height: '24px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                  background: form.is_active ? '#2563eb' : '#cbd5e1', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <span style={{ position: 'absolute', top: '3px', left: form.is_active ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0 }}>Plan activo</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>Los estudiantes solo ven los planes activos</p>
                </div>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '13px 16px', borderRadius: '12px', fontSize: '14px' }}>
                  <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '13px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving || uploadProgress}
                  style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#2563eb', cursor: (saving || uploadProgress) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: (saving || uploadProgress) ? 0.6 : 1 }}>
                  {uploadProgress ? 'Subiendo archivo...' : saving ? 'Guardando...' : editing ? 'Actualizar Plan' : 'Crear Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
