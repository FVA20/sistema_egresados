import { useState, useEffect, useRef } from 'react'
import { Navigate, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'
import { getPrograms } from '../api/student'

export default function StudentLayout() {
  const { isAuthenticated, graduate, logout } = useStudentAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [programName, setProgramName] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  if (!isAuthenticated) return <Navigate to="/portal/login" replace />

  const handleLogout = () => {
    logout()
    navigate('/portal/login')
  }

  const navLinks = [
    { to: '/portal/inicio', label: 'Inicio' },
    { to: '/portal/programas', label: 'Programas de Estudios' },
    { to: '/portal/contacto', label: 'Contáctanos' },
  ]

  const initials = `${graduate?.first_name?.[0] ?? ''}${graduate?.last_name?.[0] ?? ''}`.toUpperCase()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  const openProfile = async () => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    setShowProfile(true)
    if (!programName && graduate?.program_id) {
      try {
        const programs = await getPrograms()
        const found = programs.find(p => p.id === graduate.program_id)
        if (found) setProgramName(found.name)
      } catch {}
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <style>{`
        .student-nav-links { display: flex; align-items: center; gap: 4px; }
        .student-hamburger { display: none; }
        .student-user-name { display: block; }
        .student-mobile-menu { display: none; }
        @media (max-width: 768px) {
          .student-nav-links { display: none; }
          .student-hamburger { display: flex; }
          .student-user-name { display: none; }
          .student-mobile-menu { display: block; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: 'linear-gradient(135deg, #00aae4 0%, #006fa0 100%)',
        boxShadow: '0 4px 24px rgba(0,170,228,0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link to="/portal/inicio" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/INSIGNIA-ELA.png" alt="IESTP ELA" style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'contain', flexShrink: 0, background: 'rgba(255,255,255,0.95)', padding: '3px' }} />
            <div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: '14px', margin: 0, letterSpacing: '-0.01em' }}>Portal Egresados</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: 0 }}>IESTP Enrique López Albújar</p>
            </div>
          </Link>

          {/* Nav Links — desktop */}
          <div className="student-nav-links">
            {navLinks.map(link => {
              const active = location.pathname === link.to || (link.to !== '/portal/inicio' && location.pathname.startsWith(link.to))
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: active ? 'white' : 'rgba(255,255,255,0.7)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '14px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                    border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Derecha: Avatar (desktop) + Hamburguesa (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Avatar con dropdown — desktop */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: dropdownOpen ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: '1px solid transparent',
                  borderRadius: '12px',
                  padding: '6px 10px 6px 6px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', color: 'white', flexShrink: 0 }}>
                  {initials}
                </div>
                <div className="student-user-name" style={{ textAlign: 'left' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', margin: 0, lineHeight: 1.2 }}>{graduate?.first_name} {graduate?.last_name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>Egresado</p>
                </div>
                <svg style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.6)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                  border: '1px solid #e2e8f0',
                  minWidth: '200px',
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  <div style={{ padding: '16px 20px', background: '#f0f9ff', borderBottom: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{graduate?.first_name} {graduate?.last_name}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>{graduate?.email}</p>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <button
                      onClick={openProfile}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#334155' }}
                    >
                      <svg style={{ width: '16px', height: '16px', color: '#00aae4', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Mi Perfil
                    </button>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#dc2626' }}
                    >
                      <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburguesa — mobile */}
            <button
              className="student-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white', alignItems: 'center', justifyContent: 'center' }}
            >
              {mobileMenuOpen ? (
                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="student-mobile-menu" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,111,160,0.97)', padding: '12px 16px 16px' }}>
            {/* Info del usuario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', marginBottom: '10px' }}>
              <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: 'white', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>{graduate?.first_name} {graduate?.last_name}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{graduate?.email}</p>
              </div>
            </div>

            {/* Links de navegación */}
            {navLinks.map(link => {
              const active = location.pathname === link.to || (link.to !== '/portal/inicio' && location.pathname.startsWith(link.to))
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'block',
                    color: active ? 'white' : 'rgba(255,255,255,0.8)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '15px',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                    textDecoration: 'none',
                    marginBottom: '4px',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />

            {/* Mi Perfil */}
            <button
              onClick={openProfile}
              style={{ width: '100%', textAlign: 'left', display: 'block', color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '15px', padding: '13px 16px', borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '4px' }}
            >
              Mi Perfil
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={handleLogout}
              style={{ width: '100%', textAlign: 'left', display: 'block', color: '#fca5a5', fontWeight: 600, fontSize: '15px', padding: '13px 16px', borderRadius: '12px', background: 'rgba(220,38,38,0.15)', border: 'none', cursor: 'pointer' }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <Outlet />
      </main>

      {/* Modal de Perfil */}
      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>

            <div style={{ background: 'linear-gradient(135deg, #00aae4, #006fa0)', padding: '36px 36px 32px', position: 'relative' }}>
              <button
                onClick={() => setShowProfile(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '26px', color: 'white', marginBottom: '16px' }}>
                {initials}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: '0 0 4px' }}>{graduate?.first_name} {graduate?.last_name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>Egresado — IESTP Enrique López Albújar</p>
            </div>

            <div style={{ padding: '28px 36px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  icon: <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
                  label: 'Correo electrónico',
                  value: graduate?.email ?? '—',
                },
                {
                  icon: <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
                  label: 'Programa de estudios',
                  value: programName || 'Cargando...',
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '34px', height: '34px', background: '#f0fbff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00aae4', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{item.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.value}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowProfile(false)}
                style={{ marginTop: '4px', width: '100%', padding: '13px', background: '#00aae4', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,170,228,0.35)' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
