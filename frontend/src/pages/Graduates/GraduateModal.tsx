import { useState } from 'react'
import type { Graduate, Program } from '../../types'
import { createGraduate, updateGraduate } from '../../api/graduates'

interface Props {
  graduate: Graduate | null
  programs: Program[]
  onClose: () => void
  onSave: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', border: '1px solid #e2e8f0',
  borderRadius: '12px', fontSize: '14px', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box', color: '#0f172a',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
}

export default function GraduateModal({ graduate, programs, onClose, onSave }: Props) {
  const isEdit = !!graduate
  const [form, setForm] = useState({
    first_name:      graduate?.first_name      ?? '',
    last_name:       graduate?.last_name       ?? '',
    document_number: graduate?.document_number ?? '',
    email:           graduate?.email           ?? '',
    phone:           graduate?.phone           ?? '',
    program_id:      graduate?.program_id      ?? programs[0]?.id ?? 0,
    graduation_year: graduate?.graduation_year ?? new Date().getFullYear(),
    enrollment_year: graduate?.enrollment_year ?? '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const payload = {
        ...form,
        program_id:      Number(form.program_id),
        graduation_year: Number(form.graduation_year),
        enrollment_year: form.enrollment_year ? Number(form.enrollment_year) : undefined,
      }
      isEdit ? await updateGraduate(graduate.id, payload) : await createGraduate(payload as any)
      onSave()
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '560px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{isEdit ? 'Editar Egresado' : 'Nuevo Egresado'}</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Completa los datos del egresado</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '10px', borderRadius: '12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>

          {/* Nombres y Apellidos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nombres</label>
              <input name="first_name" value={form.first_name} onChange={set} required placeholder="Ej: Juan Carlos" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Apellidos</label>
              <input name="last_name" value={form.last_name} onChange={set} required placeholder="Ej: García López" style={inputStyle} />
            </div>
          </div>

          {/* Documento y Correo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>N° Documento</label>
              <input name="document_number" value={form.document_number} onChange={set} required placeholder="Ej: 74512369" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Correo Electrónico</label>
              <input name="email" type="email" value={form.email} onChange={set} required placeholder="correo@ejemplo.com" style={inputStyle} />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input name="phone" value={form.phone} onChange={set} placeholder="Opcional" style={inputStyle} />
          </div>


          {/* Programa */}
          <div>
            <label style={labelStyle}>Programa de Estudios</label>
            <select name="program_id" value={form.program_id} onChange={set} required style={inputStyle}>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Años */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Año de Ingreso</label>
              <input name="enrollment_year" type="number" value={form.enrollment_year} onChange={set} placeholder="Opcional" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Año de Egreso</label>
              <input name="graduation_year" type="number" value={form.graduation_year} onChange={set} required style={inputStyle} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '13px 16px', borderRadius: '12px', fontSize: '14px' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              {error}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '13px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Egresado'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
