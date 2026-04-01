import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { getContactInfo } from '../api/student'

interface ContactItem {
  id: number
  key: string
  label: string
  title: string
  description: string
}

const ICONS: Record<string, ReactElement> = {
  horario: (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  direccion: (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  correo: (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
}

const STYLES: Record<string, { color: string; bg: string }> = {
  horario:   { color: '#00aae4', bg: '#eff6ff' },
  direccion: { color: '#059669', bg: '#ecfdf5' },
  correo:    { color: '#00aae4', bg: '#f0fbff' },
}

export default function StudentContactPage() {
  const [items, setItems] = useState<ContactItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContactInfo()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const correoItem = items.find(i => i.key === 'correo')

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>Contáctanos</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>
          Estamos aquí para ayudarte. Puedes visitarnos, llamarnos o escribirnos.
        </p>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#00aae4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {items.map(item => {
            const style = STYLES[item.key] ?? STYLES.correo
            return (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '40px 32px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '20px',
                }}
              >
                <div style={{ width: '60px', height: '60px', background: style.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.color }}>
                  {ICONS[item.key]}
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{item.label}</p>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #00aae4 0%, #006fa0 100%)',
        borderRadius: '20px',
        padding: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: '0 0 10px' }}>¿Necesitas asistencia?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
            Nuestro equipo está disponible para atenderte durante el horario indicado.<br />
            No dudes en comunicarte con nosotros.
          </p>
        </div>
        <a
          href={`https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(`https://mail.google.com/mail/?view=cm&to=${correoItem?.description ?? 'direccion@iestpela.edu.pe'}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#00aae4',
            fontWeight: 800,
            padding: '14px 32px',
            borderRadius: '14px',
            fontSize: '15px',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Enviar Correo
        </a>
      </div>

    </div>
  )
}
