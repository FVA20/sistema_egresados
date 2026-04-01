import { useEffect, useState } from 'react'
import { exportExcel, getStats } from '../../api/reports'
import { getGraduates } from '../../api/graduates'
import { getPrograms } from '../../api/programs'
import type { Program } from '../../types'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2014 }, (_, i) => CURRENT_YEAR - i)

export default function ReportsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [yearFilter, setYearFilter] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [employmentFilter, setEmploymentFilter] = useState('')

  const [loadingExcel, setLoadingExcel] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  // Encuestas
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  const [surveyYear, setSurveyYear] = useState('')
  const [surveyProgram, setSurveyProgram] = useState('')
  const [sendingsurveys, setSendingSurveys] = useState(false)
  const [surveyError, setSurveyError] = useState('')

  useEffect(() => { getPrograms().then(setPrograms) }, [])

  const handleExport = async () => {
    setLoadingExcel(true)
    try {
      await exportExcel({
        program_id: programFilter ? Number(programFilter) : undefined,
        graduation_year: yearFilter ? Number(yearFilter) : undefined,
        employment_filter: employmentFilter || undefined,
      })
    } finally { setLoadingExcel(false) }
  }

  const handlePdf = async () => {
    setLoadingPdf(true)
    try {
      const [stats, graduates] = await Promise.all([
        getStats(),
        getGraduates({ limit: 500, program_id: programFilter ? Number(programFilter) : undefined, graduation_year: yearFilter ? Number(yearFilter) : undefined }),
      ])
      const programName = programs.find(p => p.id === Number(programFilter))?.name ?? 'Todos los programas'

      const rows = graduates.map(g => {
        const prog = programs.find(p => p.id === g.program_id)?.name ?? '—'
        return `<tr>
          <td>${g.first_name} ${g.last_name}</td>
          <td>${g.document_number}</td>
          <td>${prog}</td>
          <td>${g.graduation_year}</td>
          <td>${g.email}</td>
        </tr>`
      }).join('')

      const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Reporte de Egresados</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; color: #0f172a; padding: 40px; }
  .header { background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 32px 40px; border-radius: 12px; margin-bottom: 32px; }
  .header h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
  .header p { font-size: 13px; opacity: 0.75; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; }
  .stat .val { font-size: 28px; font-weight: 900; color: #0891b2; }
  .stat .lbl { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { background: #f8fafc; }
  th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
  td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <h1>Reporte de Egresados</h1>
    <p>IESTP Enrique López Albújar &nbsp;·&nbsp; ${programName}${yearFilter ? ` &nbsp;·&nbsp; Año ${yearFilter}` : ''} &nbsp;·&nbsp; Generado el ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="val">${stats.total_graduates}</div><div class="lbl">Total Egresados</div></div>
    <div class="stat"><div class="val">${stats.employment_rate}%</div><div class="lbl">Tasa de Empleabilidad</div></div>
    <div class="stat"><div class="val">${stats.career_related_rate}%</div><div class="lbl">Empleados en su Carrera</div></div>
  </div>
  <p class="section-title">Padrón de Egresados (${graduates.length} registros)</p>
  <table>
    <thead><tr><th>Nombre</th><th>Documento</th><th>Programa</th><th>Año</th><th>Correo</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Sistema de Egresados — IESTP Enrique López Albújar</div>
  <script>window.onload = () => { window.print() }</script>
</body></html>`

      const win = window.open('', '_blank')
      if (win) { win.document.write(html); win.document.close() }
    } finally { setLoadingPdf(false) }
  }

  const handleSendSurveys = async () => {
    setSendingSurveys(true)
    setSurveyError('')
    try {
      const graduates = await getGraduates({
        limit: 500,
        program_id: surveyProgram ? Number(surveyProgram) : undefined,
        graduation_year: surveyYear ? Number(surveyYear) : undefined,
      })
      const emails = graduates.map(g => g.email).filter(Boolean)
      if (emails.length === 0) {
        setSurveyError('No se encontraron egresados con correo registrado para los filtros seleccionados.')
        return
      }
      const programName = surveyProgram ? programs.find(p => p.id === Number(surveyProgram))?.name : ''
      const subject = `Encuesta de Seguimiento Laboral${programName ? ` — ${programName}` : ''} — IESTP Enrique López Albújar`
      const body = `Estimado egresado,\n\nEl IESTP Enrique López Albújar te invita a actualizar tu situación laboral actual en nuestra encuesta de seguimiento.\n\nTu participación es muy importante para mejorar nuestros programas académicos.\n\nIngresa al Portal de Egresados para más información: http://localhost:5173/portal\n\nAtentamente,\nIESTP Enrique López Albújar`
      const gmailUrl = `https://mail.google.com/mail/?view=cm&bcc=${encodeURIComponent(emails.join(','))}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      const url = `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(gmailUrl)}`
      window.open(url, '_blank')
      setShowSurveyModal(false)
    } catch {
      setSurveyError('Error al obtener egresados. Intenta de nuevo.')
    } finally { setSendingSurveys(false) }
  }

  const EMPLOYMENT_LABELS: Record<string, string> = {
    sin_empleo: 'Sin empleo',
    en_carrera: 'Trabajan en su carrera',
    fuera_carrera: 'Fuera de su carrera',
  }

  const hasFilters = yearFilter || programFilter || employmentFilter

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div>
        <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Reportes</h1>
        <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>Exporta y genera informes del sistema</p>
      </div>

      {/* Filtros globales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '20px 28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Filtros para reportes</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <select
            value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            style={{ padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', color: yearFilter ? '#0f172a' : '#94a3b8', minWidth: '180px', outline: 'none' }}
          >
            <option value="">Todos los años</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={programFilter} onChange={e => setProgramFilter(e.target.value)}
            style={{ padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', color: programFilter ? '#0f172a' : '#94a3b8', minWidth: '220px', outline: 'none' }}
          >
            <option value="">Todos los programas</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={employmentFilter} onChange={e => setEmploymentFilter(e.target.value)}
            style={{ padding: '11px 16px', border: `1px solid ${employmentFilter ? '#93c5fd' : '#e2e8f0'}`, borderRadius: '12px', fontSize: '14px', background: employmentFilter ? '#eff6ff' : '#f8fafc', color: employmentFilter ? '#1d4ed8' : '#94a3b8', minWidth: '220px', outline: 'none', fontWeight: employmentFilter ? 600 : 400 }}
          >
            <option value="">Situación laboral — Todos</option>
            <option value="sin_empleo">Sin empleo</option>
            <option value="en_carrera">Trabajan en su carrera</option>
            <option value="fuera_carrera">Fuera de su carrera</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setYearFilter(''); setProgramFilter(''); setEmploymentFilter('') }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', cursor: 'pointer' }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              Limpiar filtros
            </button>
          )}
          {hasFilters && (
            <span style={{ fontSize: '12px', color: '#0891b2', background: '#ecfeff', border: '1px solid #a5f3fc', padding: '6px 14px', borderRadius: '99px', fontWeight: 600 }}>
              Filtros activos: {[yearFilter && `Año ${yearFilter}`, programFilter && programs.find(p => p.id === Number(programFilter))?.name, employmentFilter && EMPLOYMENT_LABELS[employmentFilter]].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
      </div>

      {/* Card Excel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', padding: '44px 48px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '68px', height: '68px', background: 'rgba(255,255,255,0.2)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 className="font-bold text-white" style={{ fontSize: '20px' }}>Exportar Padrón de Egresados</h2>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#d1fae5', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: '99px' }}>Excel</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, maxWidth: '480px' }}>
                  Descarga el listado con datos personales, programa académico e historial laboral en formato .xlsx.
                  {hasFilters && <strong style={{ color: 'white' }}> Aplicando filtros activos.</strong>}
                </p>
              </div>
            </div>
            <button
              onClick={handleExport} disabled={loadingExcel}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', color: '#059669', fontWeight: 700, padding: '14px 28px', borderRadius: '14px', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', flexShrink: 0, opacity: loadingExcel ? 0.7 : 1 }}
            >
              {loadingExcel ? (
                <><span className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" /> Generando...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Descargar Excel</>
              )}
            </button>
          </div>
        </div>
        <div style={{ padding: '36px 48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>El archivo incluye</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {['Nombres y apellidos', 'N° de documento', 'Correo electrónico', 'Programa académico', 'Año de egreso', 'Historial laboral'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', borderRadius: '12px', padding: '13px 16px' }}>
                <div style={{ width: '28px', height: '28px', background: '#d1fae5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                </div>
                <span className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards PDF + Encuestas */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Más reportes</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* PDF */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ width: '52px', height: '52px', background: '#fef2f2', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg className="w-6 h-6" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="font-bold text-slate-800" style={{ fontSize: '15px', marginBottom: '6px' }}>Reporte en PDF</h3>
              <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
                Informe con estadísticas y padrón completo listo para imprimir o guardar como PDF.
                {hasFilters && <span style={{ color: '#0891b2' }}> Con filtros activos.</span>}
              </p>
              <button
                onClick={handlePdf} disabled={loadingPdf}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#ef4444', color: 'white', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer', opacity: loadingPdf ? 0.7 : 1, boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}
              >
                {loadingPdf ? (
                  <><span className="w-4 h-4 border-2 border-red-200 border-t-white rounded-full animate-spin" />Preparando...</>
                ) : (
                  <><svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>Generar PDF</>
                )}
              </button>
            </div>
          </div>

          {/* Encuestas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{ width: '52px', height: '52px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg className="w-6 h-6" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="font-bold text-slate-800" style={{ fontSize: '15px', marginBottom: '6px' }}>Enviar Encuestas</h3>
              <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
                Envía la encuesta de seguimiento laboral directamente por Gmail a los correos de los egresados.
              </p>
              <button
                onClick={() => { setShowSurveyModal(true); setSurveyResults(null); setSurveyError('') }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
              >
                <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                Enviar encuestas
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Nota */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '22px 28px' }}>
        <div style={{ width: '40px', height: '40px', background: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p className="text-blue-700" style={{ fontSize: '14px', lineHeight: 1.6 }}>
          Los reportes incluyen todos los datos registrados hasta el momento de la descarga. Los filtros de año y programa aplican a Excel y PDF.
        </p>
      </div>

      {/* Modal de encuestas */}
      {showSurveyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>

            {/* Header modal */}
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 900, margin: 0 }}>Enviar Encuestas por Gmail</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '4px 0 0' }}>Envía directamente a los correos de los egresados</p>
              </div>
              <button onClick={() => setShowSurveyModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Se abrirá Gmail con todos los correos de los egresados en el campo BCC listos para enviar la encuesta de seguimiento laboral.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Año de egreso (opcional)</label>
                  <select value={surveyYear} onChange={e => setSurveyYear(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', outline: 'none' }}>
                    <option value="">Todos los años</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Programa (opcional)</label>
                  <select value={surveyProgram} onChange={e => setSurveyProgram(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', outline: 'none' }}>
                    <option value="">Todos los programas</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {surveyError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: '#dc2626' }}>
                  {surveyError}
                </div>
              )}

              <button
                onClick={handleSendSurveys} disabled={sendingsurveys}
                style={{ width: '100%', padding: '14px', background: '#2563eb', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: sendingsurveys ? 'default' : 'pointer', opacity: sendingsurveys ? 0.7 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {sendingsurveys ? (
                  <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Cargando correos...</>
                ) : (
                  <><svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>Abrir Gmail y enviar encuesta →</>
                )}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
