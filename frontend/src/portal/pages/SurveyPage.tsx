import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSurveyInfo, respondSurvey } from '../../api/surveys'

const SECTORS = [
  'Tecnología e Informática', 'Salud y Medicina', 'Educación', 'Administración y Finanzas',
  'Construcción e Ingeniería', 'Comercio y Ventas', 'Agricultura y Ganadería',
  'Manufactura e Industria', 'Servicios Públicos', 'Otro',
]

export default function SurveyPage() {
  const { token } = useParams<{ token: string }>()
  const [info, setInfo] = useState<{ graduate_name: string; program_name: string } | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [isEmployed, setIsEmployed] = useState<boolean | null>(null)
  const [form, setForm] = useState({
    company_name: '', company_sector: '', job_title: '',
    is_career_related: true, employment_type: 'Full-time', location_city: '',
  })

  useEffect(() => {
    if (!token) return
    getSurveyInfo(token)
      .then(setInfo)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async () => {
    if (isEmployed === null) return
    setSubmitting(true)
    try {
      await respondSurvey(token!, {
        is_employed: isEmployed,
        ...(isEmployed ? {
          company_name: form.company_name || undefined,
          company_sector: form.company_sector || undefined,
          job_title: form.job_title || undefined,
          is_career_related: form.is_career_related,
          employment_type: form.employment_type,
          location_city: form.location_city || undefined,
        } : {}),
      })
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0',
    borderRadius: '12px', fontSize: '14px', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', color: '#0f172a',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9ff', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px' }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: '560px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #00aae4, #006fa0)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          🎓
        </div>
        <div>
          <p style={{ color: '#0f172a', fontWeight: 800, fontSize: '15px', margin: 0 }}>Portal Egresados</p>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>IESTP Enrique López Albújar</p>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '560px', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>

        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #00aae4 0%, #006fa0 100%)', padding: '36px 40px' }}>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 8px' }}>Encuesta de Seguimiento</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Actualiza tu situación laboral actual</p>
        </div>

        <div style={{ padding: '36px 40px' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#00aae4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Encuesta no disponible</p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Done */}
          {done && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>¡Gracias por responder!</p>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Tu información ha sido registrada correctamente.<br />
                Tus respuestas nos ayudan a mejorar nuestros programas.
              </p>
            </div>
          )}

          {/* Form */}
          {!loading && !error && !done && info && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Nombre del egresado */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', padding: '18px 20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#00aae4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Egresado</p>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{info.graduate_name}</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{info.program_name}</p>
              </div>

              {/* Pregunta principal */}
              <div>
                <label style={labelStyle}>¿Actualmente tienes trabajo?</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[{ val: true, label: 'Sí, estoy empleado' }, { val: false, label: 'No, estoy buscando' }].map(opt => (
                    <button
                      key={String(opt.val)}
                      onClick={() => setIsEmployed(opt.val)}
                      style={{
                        flex: 1, padding: '14px', border: `2px solid ${isEmployed === opt.val ? '#00aae4' : '#e2e8f0'}`,
                        borderRadius: '14px', background: isEmployed === opt.val ? '#f0fbff' : 'white',
                        fontWeight: isEmployed === opt.val ? 700 : 500, fontSize: '14px',
                        color: isEmployed === opt.val ? '#00aae4' : '#475569', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {opt.val ? '✅ ' : '❌ '}{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos de empleo */}
              {isEmployed === true && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={labelStyle}>Empresa / Organización</label>
                    <input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} style={inputStyle} placeholder="Nombre de la empresa" />
                  </div>
                  <div>
                    <label style={labelStyle}>Cargo / Puesto</label>
                    <input value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} style={inputStyle} placeholder="Ej: Analista de sistemas" />
                  </div>
                  <div>
                    <label style={labelStyle}>Rubro / Sector</label>
                    <select value={form.company_sector} onChange={e => setForm({ ...form, company_sector: e.target.value })} style={inputStyle}>
                      <option value="">Selecciona un rubro</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Tipo de empleo</label>
                    <select value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })} style={inputStyle}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Independiente">Independiente / Freelance</option>
                      <option value="Practicante">Practicante</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Ciudad</label>
                    <input value={form.location_city} onChange={e => setForm({ ...form, location_city: e.target.value })} style={inputStyle} placeholder="Ej: Ferreñafe" />
                  </div>
                  <div>
                    <label style={labelStyle}>¿Tu trabajo está relacionado a tu carrera?</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {[{ val: true, label: 'Sí' }, { val: false, label: 'No' }].map(opt => (
                        <button
                          key={String(opt.val)}
                          onClick={() => setForm({ ...form, is_career_related: opt.val })}
                          style={{
                            flex: 1, padding: '12px', border: `2px solid ${form.is_career_related === opt.val ? '#00aae4' : '#e2e8f0'}`,
                            borderRadius: '12px', background: form.is_career_related === opt.val ? '#f0fbff' : 'white',
                            fontWeight: form.is_career_related === opt.val ? 700 : 500, fontSize: '14px',
                            color: form.is_career_related === opt.val ? '#00aae4' : '#475569', cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              {isEmployed !== null && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '15px', background: '#00aae4', color: 'white',
                    fontWeight: 800, fontSize: '15px', border: 'none', borderRadius: '14px',
                    cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(0,170,228,0.4)', marginTop: '4px',
                  }}
                >
                  {submitting ? 'Enviando...' : 'Enviar respuesta →'}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '24px', textAlign: 'center' }}>
        IESTP Enrique López Albújar — Sistema de Seguimiento de Egresados
      </p>
    </div>
  )
}
