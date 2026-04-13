import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'
import { getPrograms } from '../api/student'

interface Program {
  id: number
  name: string
  faculty: string
  degree_level: string
  duration_years: number
  active: boolean
}

export default function StudentProgramsPage() {
  const { graduate } = useStudentAuth()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getPrograms()
      .then(programs => {
        const mine = programs.find(p => p.id === graduate?.program_id)
        setProgram(mine ?? null)
      })
      .catch(() => setError('No se pudo cargar el programa.'))
      .finally(() => setLoading(false))
  }, [graduate])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>Programa de Estudio</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>Accede a los planes de trabajo de tu carrera</p>
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

      {!loading && !error && !program && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: '17px', fontWeight: 700, color: '#475569' }}>No tienes un programa asignado.</p>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>Contacta al administrador para que actualice tu información.</p>
        </div>
      )}

      {!loading && !error && program && (
        <div>
          {/* Card del programa */}
          <div style={{
            background: 'linear-gradient(135deg, #00aae4, #006fa0)',
            borderRadius: '24px',
            padding: '48px 56px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.25)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Tu carrera técnica</p>
                  <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: '0 0 12px', lineHeight: 1.2 }}>{program.name}</h2>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: 'white', padding: '5px 14px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.25)' }}>
                      {program.degree_level}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: 'white', padding: '5px 14px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.25)' }}>
                      {program.duration_years} año{program.duration_years !== 1 ? 's' : ''}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: 'white', padding: '5px 14px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.25)' }}>
                      {program.faculty}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/portal/programas/${program.id}`)}
                style={{
                  background: 'white',
                  color: '#00aae4',
                  fontWeight: 800,
                  padding: '16px 36px',
                  borderRadius: '14px',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver planes de trabajo
              </button>
            </div>
          </div>

          {/* Info adicional */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <svg style={{ width: '20px', height: '20px', color: '#00aae4', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>¿Qué son los planes de trabajo?</p>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
              Los planes de trabajo son documentos elaborados por el instituto que contienen propuestas laborales, convocatorias y orientación profesional específica para tu carrera. Puedes descargar los archivos adjuntos para revisarlos con detalle.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
