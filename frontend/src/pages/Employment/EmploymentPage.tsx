import { useEffect, useState, useMemo } from 'react'
import { getGraduates } from '../../api/graduates'
import { getEmploymentByGraduate, createEmployment, updateEmployment, deleteEmployment } from '../../api/employment'
import { getPrograms } from '../../api/programs'
import type { Graduate, EmploymentRecord, Program } from '../../types'

const AVATAR_COLORS = ['#3b82f6','#10b981','#8b5cf6','#f43f5e','#f59e0b','#06b6d4']

export default function EmploymentPage() {
  const [graduates, setGraduates]       = useState<Graduate[]>([])
  const [programs, setPrograms]         = useState<Program[]>([])
  const [search, setSearch]             = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [filterYear, setFilterYear]     = useState('')
  const [selectedGrad, setSelectedGrad] = useState<Graduate | null>(null)
  const [records, setRecords]           = useState<EmploymentRecord[]>([])
  const [showForm, setShowForm]         = useState(false)
  const [editingRecord, setEditingRecord] = useState<EmploymentRecord | null>(null)
  const [saving, setSaving]             = useState(false)
  const [form, setForm] = useState({
    is_employed: true, company_name: '', company_sector: '', job_title: '',
    is_career_related: true, employment_type: 'Full-time',
    location_city: '', salary_range: '', is_current: true as boolean,
  })

  useEffect(() => {
    getGraduates({ limit: 500 }).then(setGraduates)
    getPrograms().then(setPrograms)
  }, [])

  const graduationYears = useMemo(() => {
    const years = [...new Set(graduates.map(g => g.graduation_year))].sort((a, b) => b - a)
    return years
  }, [graduates])

  const emptyForm = { is_employed: true, company_name: '', company_sector: '', job_title: '', is_career_related: true, employment_type: 'Full-time', location_city: '', salary_range: '', is_current: true }

  const select = (g: Graduate) => {
    setSelectedGrad(g); setShowForm(false); setEditingRecord(null)
    getEmploymentByGraduate(g.id).then(setRecords)
  }

  const openEdit = (r: EmploymentRecord) => {
    setEditingRecord(r)
    setForm({
      is_employed: r.is_employed,
      company_name: r.company_name || '',
      company_sector: r.company_sector || '',
      job_title: r.job_title || '',
      is_career_related: r.is_career_related ?? true,
      employment_type: r.employment_type || 'Full-time',
      location_city: r.location_city || '',
      salary_range: r.salary_range || '',
      is_current: r.is_current,
    })
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditingRecord(null); setForm(emptyForm) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedGrad) return
    setSaving(true)
    try {
      if (editingRecord) {
        await updateEmployment(editingRecord.id, form as any)
      } else {
        await createEmployment({ ...form, graduate_id: selectedGrad.id } as any)
      }
      closeForm(); select(selectedGrad)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return
    await deleteEmployment(id); if (selectedGrad) select(selectedGrad)
  }

  const filtered = graduates.filter(g => {
    const matchSearch = `${g.first_name} ${g.last_name} ${g.document_number}`.toLowerCase().includes(search.toLowerCase())
    const matchProgram = filterProgram === '' || g.program_id === Number(filterProgram)
    const matchYear = filterYear === '' || g.graduation_year === Number(filterYear)
    return matchSearch && matchProgram && matchYear
  })

  const currentEmployed = records.filter(r => r.is_employed && r.is_current).length
  const currentInCareer = records.filter(r => r.is_career_related && r.is_current).length

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      <style>{`
        .empl-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 28px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
        .empl-form-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; }
        @media (max-width: 640px) {
          .empl-stats-grid { grid-template-columns: 1fr; }
          .empl-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ paddingLeft: '20px' }}>
        <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Empleabilidad</h1>
        <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>Historial y registros laborales de los egresados</p>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '28px', alignItems: 'start' }}>

        {/* Lista de egresados */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p className="font-bold text-slate-700" style={{ fontSize: '14px' }}>Seleccionar egresado</p>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                type="text" placeholder="Buscar por nombre o DNI..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '38px', background: 'white' }}
              />
            </div>
            <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ ...inputStyle, background: 'white', color: filterProgram ? '#0f172a' : '#94a3b8' }}>
              <option value="">Todos los programas</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ ...inputStyle, background: 'white', color: filterYear ? '#0f172a' : '#94a3b8' }}>
              <option value="">Todos los años</option>
              {graduationYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {(search || filterProgram || filterYear) && (
              <button onClick={() => { setSearch(''); setFilterProgram(''); setFilterYear('') }}
                style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0' }}>
                Limpiar filtros · {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </button>
            )}
            {!search && !filterProgram && !filterYear && (
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{filtered.length} egresado{filtered.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '520px' }}>
            {filtered.length === 0 ? (
              <p className="text-slate-400 text-center" style={{ padding: '48px 16px', fontSize: '14px' }}>Sin resultados</p>
            ) : filtered.map(g => (
              <button
                key={g.id} onClick={() => select(g)}
                style={{ width: '100%', textAlign: 'left', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'background 0.15s', borderBottom: '1px solid #f1f5f9', background: selectedGrad?.id === g.id ? '#2563eb' : 'white', cursor: 'pointer', border: 'none' }}
                onMouseEnter={e => { if (selectedGrad?.id !== g.id) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                onMouseLeave={e => { if (selectedGrad?.id !== g.id) (e.currentTarget as HTMLElement).style.background = 'white' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: AVATAR_COLORS[g.id % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  {g.first_name[0]}{g.last_name[0]}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: selectedGrad?.id === g.id ? 'white' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.first_name} {g.last_name}</p>
                  <p style={{ fontSize: '12px', color: selectedGrad?.id === g.id ? '#bfdbfe' : '#94a3b8', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.document_number}</p>
                </div>
                {selectedGrad?.id === g.id && <svg className="w-4 h-4 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>}
              </button>
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!selectedGrad ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <div style={{ width: '72px', height: '72px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="w-9 h-9 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <p className="font-bold text-slate-700" style={{ fontSize: '17px' }}>Selecciona un egresado</p>
              <p className="text-slate-400" style={{ fontSize: '14px', maxWidth: '300px' }}>Haz clic en un egresado de la lista para gestionar sus registros laborales</p>
            </div>
          ) : (
            <>
              {/* Tarjeta del egresado */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '32px 36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: AVATAR_COLORS[selectedGrad.id % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                      {selectedGrad.first_name[0]}{selectedGrad.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900" style={{ fontSize: '17px' }}>{selectedGrad.first_name} {selectedGrad.last_name}</p>
                      <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '4px' }}>{selectedGrad.document_number} · {selectedGrad.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { if (showForm) closeForm(); else setShowForm(true) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', background: showForm ? '#f1f5f9' : '#2563eb', color: showForm ? '#475569' : 'white', boxShadow: showForm ? 'none' : '0 4px 14px rgba(37,99,235,0.35)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showForm ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>}
                    </svg>
                    {showForm ? 'Cancelar' : 'Agregar registro'}
                  </button>
                </div>

                {records.length > 0 && (
                  <div className="empl-stats-grid">
                    {[
                      { label: 'Registros totales', val: records.length,               color: '#0f172a' },
                      { label: 'Empleado (actual)', val: currentEmployed ? 'Sí' : 'No', color: currentEmployed ? '#059669' : '#ef4444' },
                      { label: 'En su carrera',     val: currentInCareer ? 'Sí' : 'No', color: currentInCareer ? '#2563eb' : '#94a3b8' },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#f8fafc', borderRadius: '16px', padding: '18px 20px' }}>
                        <p style={{ fontSize: '28px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</p>
                        <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '8px' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario */}
              {showForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div style={{ padding: '20px 32px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <p className="font-bold text-slate-900" style={{ fontSize: '16px' }}>{editingRecord ? 'Editar Registro Laboral' : 'Nuevo Registro Laboral'}</p>
                    <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '4px' }}>{editingRecord ? 'Modifica los datos del registro seleccionado' : 'Registra la situación laboral actual del egresado'}</p>
                  </div>
                  <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px' }}>
                      {[
                        { key: 'is_employed', label: '¿Está trabajando actualmente?' },
                        { key: 'is_career_related', label: '¿Relacionado a su carrera?' },
                        { key: 'is_current', label: '¿Es el registro vigente?' },
                      ].map(c => (
                        <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                          <button type="button" onClick={() => setForm({ ...form, [c.key]: !(form as any)[c.key] })}
                            style={{ position: 'relative', width: '48px', height: '28px', borderRadius: '99px', border: 'none', cursor: 'pointer', background: (form as any)[c.key] ? '#2563eb' : '#cbd5e1', transition: 'background 0.2s', flexShrink: 0 }}>
                            <span style={{ position: 'absolute', top: '4px', left: '0', width: '20px', height: '20px', background: 'white', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'transform 0.2s', transform: (form as any)[c.key] ? 'translateX(24px)' : 'translateX(4px)' }} />
                          </button>
                          <span className="font-semibold text-slate-700" style={{ fontSize: '14px' }}>{c.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="empl-form-grid">
                      {[
                        { name: 'company_name', label: 'Empresa', placeholder: 'Nombre de empresa' },
                        { name: 'company_sector', label: 'Rubro / Sector', placeholder: 'Ej: Tecnología' },
                        { name: 'job_title', label: 'Cargo', placeholder: 'Ej: Analista de sistemas' },
                        { name: 'location_city', label: 'Ciudad', placeholder: 'Ej: Lima' },
                        { name: 'salary_range', label: 'Rango Salarial', placeholder: 'Ej: S/ 2000 - 3000' },
                      ].map(f => (
                        <div key={f.name}>
                          <label style={labelStyle}>{f.label}</label>
                          <input value={(form as any)[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} style={inputStyle} />
                        </div>
                      ))}
                      <div>
                        <label style={labelStyle}>Tipo de Empleo</label>
                        <select value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })} style={inputStyle}>
                          <option>Full-time</option><option>Part-time</option><option>Freelance</option><option>Prácticas</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                      <button type="button" onClick={closeForm} style={{ flex: 1, padding: '13px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                      <button type="submit" disabled={saving} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: saving ? 0.6 : 1 }}>{saving ? 'Guardando...' : editingRecord ? 'Guardar Cambios' : 'Guardar Registro'}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Registros */}
              {records.length === 0 && !showForm ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                  <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <p className="font-bold text-slate-700" style={{ fontSize: '16px' }}>Sin registros laborales</p>
                  <p className="text-slate-400" style={{ fontSize: '14px' }}>Agrega el primer registro para este egresado</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {records.map(r => (
                    <div key={r.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all" style={{ padding: '24px 28px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: r.is_employed ? '#ecfdf5' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {r.is_employed
                            ? <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                            : <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: `1px solid ${r.is_employed ? '#a7f3d0' : '#e2e8f0'}`, background: r.is_employed ? '#ecfdf5' : '#f8fafc', color: r.is_employed ? '#059669' : '#64748b' }}>{r.is_employed ? 'Empleado' : 'Sin empleo'}</span>
                            {r.is_career_related && <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8' }}>En su carrera</span>}
                            {r.employment_type && <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}>{r.employment_type}</span>}
                          </div>
                          <p className="font-bold text-slate-900" style={{ fontSize: '15px' }}>
                            {r.job_title || 'Sin cargo especificado'}
                            {r.company_name && <span className="font-normal text-slate-500"> — {r.company_name}</span>}
                          </p>
                          {(r.company_sector || r.location_city || r.salary_range) && (
                            <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '5px' }}>{[r.company_sector, r.location_city, r.salary_range].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(r)} className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl p-2.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl p-2.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
