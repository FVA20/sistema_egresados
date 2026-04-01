import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'
import { getPublishedNews } from '../api/student'

const logos = [
  '/logo1.png', '/logo2.png', '/logo3.png', '/logo4.png',
  '/logo5.png', '/logo6.png', '/logo7.png', '/logo8.png',
]

const logos2 = ['/logo9.png', '/logo10.png', '/logo11.png', '/logo12.png']

const benefits = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Oportunidades Laborales',
    description: 'Accede a planes de trabajo y oportunidades laborales de tu carrera.',
    color: '#00aae4',
    bg: '#f0fbff',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Convocatorias y Noticias',
    description: 'Mantente informado sobre convocatorias y noticias del instituto.',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Red de Egresados',
    description: 'Conecta con egresados y empresas aliadas para ampliar tu red profesional.',
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Perfil Profesional',
    description: 'Actualiza tu información profesional y mantén tu perfil al día.',
    color: '#d97706',
    bg: '#fffbeb',
  },
]

const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Noticia:      { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Convocatoria: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Evento:       { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  Comunicado:   { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
}

export default function StudentHomePage() {
  const { graduate } = useStudentAuth()
  const navigate = useNavigate()
  const [newsItems, setNewsItems] = useState<Awaited<ReturnType<typeof getPublishedNews>>>([])

  useEffect(() => { getPublishedNews().then(setNewsItems).catch(() => {}) }, [])

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <style>{`
        .home-hero { padding: 56px 64px; }
        .home-hero-title { font-size: 50px; }
        .home-benefits { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .home-news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 1024px) {
          .home-benefits { grid-template-columns: repeat(2, 1fr); }
          .home-news-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .home-hero { padding: 28px 20px; }
          .home-hero-title { font-size: 30px; }
          .home-benefits { grid-template-columns: repeat(1, 1fr); gap: 12px; }
          .home-news-grid { grid-template-columns: repeat(1, 1fr); gap: 16px; }
        }
      `}</style>

      {/* Hero */}
      <div className="home-hero" style={{
        background: 'linear-gradient(135deg, #00aae4 0%, #006fa0 100%)',
        borderRadius: '24px',
        marginBottom: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decoraciones de fondo */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '320px', height: '320px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '40%', width: '240px', height: '240px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Texto */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', padding: '6px 18px', marginBottom: '28px' }}>
              <span style={{ fontSize: '14px' }}>🎓</span>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>IESTP Enrique López Albújar</span>
            </div>
            <h1 className="home-hero-title" style={{ fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.1 }}>
              Bienvenido,<br />{graduate?.first_name}
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', lineHeight: 1.7, margin: '0 0 40px' }}>
              Este es tu espacio para acceder a convocatorias laborales, planes de trabajo y mantenerte conectado con el instituto.
            </p>
            <button
              onClick={() => navigate('/portal/programas')}
              style={{
                background: 'white',
                color: '#00aae4',
                fontWeight: 800,
                padding: '14px 32px',
                borderRadius: '14px',
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                letterSpacing: '0.01em',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
            >
              Ver Planes de Trabajo →
            </button>
          </div>
        </div>
      </div>

      {/* Section title */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '4px', height: '32px', background: 'linear-gradient(180deg, #00aae4, #006fa0)', borderRadius: '4px', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>¿Qué puedes hacer aquí?</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>Explora todo lo que el portal de egresados tiene para ti</p>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="home-benefits">
        {benefits.map((benefit, i) => (
          <div
            key={i}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '28px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,170,228,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: benefit.bg,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: benefit.color,
            }}>
              {benefit.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{benefit.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alianzas */}
      <div style={{ marginTop: '56px' }}>
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 22s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '4px', height: '32px', background: 'linear-gradient(180deg, #00aae4, #006fa0)', borderRadius: '4px', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Nuestras Alianzas</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>Empresas e instituciones que confían en nuestros egresados</p>
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '48px 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Fade izquierdo */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          {/* Fade derecho */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to left, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />

          <div className="marquee-track">
            {[...logos, ...logos].map((src, i) => (
              <div key={i} style={{
                flexShrink: 0,
                width: '210px',
                height: '110px',
                margin: '0 36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={src}
                  alt={`alianza-${(i % logos.length) + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    filter: 'grayscale(30%)',
                    opacity: 0.85,
                    transition: 'filter 0.3s, opacity 0.3s, transform 0.3s',
                  }}
                  onMouseEnter={e => {
                    const img = e.currentTarget as HTMLImageElement
                    img.style.filter = 'grayscale(0%)'
                    img.style.opacity = '1'
                    img.style.transform = 'scale(1.08)'
                  }}
                  onMouseLeave={e => {
                    const img = e.currentTarget as HTMLImageElement
                    img.style.filter = 'grayscale(30%)'
                    img.style.opacity = '0.85'
                    img.style.transform = 'scale(1)'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Noticias */}
      <div style={{ marginTop: '56px', marginBottom: '40px' }}>

        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '4px', height: '32px', background: 'linear-gradient(180deg, #00aae4, #006fa0)', borderRadius: '4px', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Noticias</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>Mantente informado con las últimas novedades del instituto</p>
          </div>
        </div>

        {newsItems.length === 0 ? (
          /* Estado vacío */
          <div className="home-news-grid">
            {[1, 2, 3].map(n => (
              <div key={n} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', background: 'linear-gradient(135deg, #f0fbff 0%, #cffafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px', color: '#a5f3fc' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div style={{ height: '14px', background: '#f1f5f9', borderRadius: '7px', width: '50%' }} />
                  <div style={{ height: '16px', background: '#f1f5f9', borderRadius: '8px', width: '90%' }} />
                  <div style={{ height: '16px', background: '#f1f5f9', borderRadius: '8px', width: '70%' }} />
                  <div style={{ height: '11px', background: '#f8fafc', borderRadius: '6px', width: '100%', marginTop: '4px' }} />
                  <div style={{ height: '11px', background: '#f8fafc', borderRadius: '6px', width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Noticias reales */
          <div className="home-news-grid">
            {newsItems.slice(0, 6).map(item => {
              const c = CATEGORY_COLORS[item.category || 'Noticia'] || CATEGORY_COLORS['Noticia']
              return (
                <div key={item.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' }}>
                  {item.image_path ? (
                    <img src={`/uploads/${item.image_path}`} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '160px', background: 'linear-gradient(135deg, #f0fbff 0%, #cffafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px', color: '#a5f3fc' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <span style={{ alignSelf: 'flex-start', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                      {item.category}
                    </span>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', lineHeight: 1.35, margin: 0 }}>{item.title}</p>
                    {item.summary && (
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.summary}
                      </p>
                    )}
                    {/* Link externo */}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#00aae4', textDecoration: 'none' }}>
                        <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        Ver más información
                      </a>
                    )}
                    {/* Archivo adjunto */}
                    {item.file_name && item.file_path && (
                      <a href={`/uploads/${item.file_path}`} download={item.file_name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', textDecoration: 'none' }}>
                        <svg style={{ width: '14px', height: '14px', color: '#00aae4', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file_name}</span>
                      </a>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '13px', height: '13px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {new Date(item.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Segunda galería dinámica */}
      <div style={{ marginTop: '56px', marginBottom: '40px' }}>
        <style>{`
          @keyframes marqueeRtl {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-track-rtl {
            display: flex;
            width: max-content;
            animation: marqueeRtl 18s linear infinite;
          }
          .marquee-track-rtl:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '56px 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to left, white, transparent)', zIndex: 2, pointerEvents: 'none' }} />

          <div className="marquee-track-rtl">
            {[...logos2, ...logos2].map((src, i) => (
              <div key={i} style={{ flexShrink: 0, width: '280px', height: '150px', margin: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={src}
                  alt={`galeria-${(i % logos2.length) + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'grayscale(30%)', opacity: 0.85, transition: 'filter 0.3s, opacity 0.3s, transform 0.3s' }}
                  onMouseEnter={e => { const img = e.currentTarget as HTMLImageElement; img.style.filter = 'grayscale(0%)'; img.style.opacity = '1'; img.style.transform = 'scale(1.08)' }}
                  onMouseLeave={e => { const img = e.currentTarget as HTMLImageElement; img.style.filter = 'grayscale(30%)'; img.style.opacity = '0.85'; img.style.transform = 'scale(1)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
