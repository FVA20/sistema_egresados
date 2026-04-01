import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const links = [
  {
    to: '/dashboard', label: 'Dashboard', desc: 'Resumen general',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth={2}/><rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth={2}/><rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth={2}/><rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth={2}/></svg>,
  },
  {
    to: '/graduates', label: 'Egresados', desc: 'Padrón de egresados',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>,
  },
  {
    to: '/employment', label: 'Empleabilidad', desc: 'Historial laboral',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  },
  {
    to: '/programs', label: 'Programas', desc: 'Carreras y facultades',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  },
  {
    to: '/workplans', label: 'Planes de Trabajo', desc: 'Planes por programa',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  },
  {
    to: '/news', label: 'Noticias', desc: 'Portal de egresados',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>,
  },
  {
    to: '/reports', label: 'Reportes', desc: 'Exportar datos',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  },
  {
    to: '/users', label: 'Usuarios', desc: 'Administradores',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  },
  {
    to: '/contact', label: 'Contacto', desc: 'Info del portal',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  },
]

function NavItem({ link, isOpen }: { link: typeof links[0]; isOpen: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      key={link.to}
      to={link.to}
      title={!isOpen ? link.label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '14px',
        padding: isOpen ? '13px 16px' : '13px 0',
        justifyContent: isOpen ? 'flex-start' : 'center',
        textDecoration: 'none',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered && !isActive ? 'translateX(4px)' : 'translateX(0)',
        background: isActive
          ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
          : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
        boxShadow: isActive ? '0 4px 14px rgba(37,99,235,0.4)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%',
              width: '3px', background: 'rgba(255,255,255,0.7)', borderRadius: '0 4px 4px 0'
            }} />
          )}
          <span style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '34px', height: '34px', borderRadius: '10px',
            transition: 'all 0.2s',
            background: isActive ? 'rgba(255,255,255,0.15)' : hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: isActive ? 'white' : hovered ? '#e2e8f0' : '#94a3b8',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}>
            {link.icon}
          </span>
          {isOpen && (
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: isActive ? 'white' : hovered ? '#e2e8f0' : '#cbd5e1', lineHeight: 1, transition: 'color 0.2s' }}>{link.label}</p>
              <p style={{ fontSize: '11px', marginTop: '4px', color: isActive ? 'rgba(255,255,255,0.6)' : '#475569', transition: 'color 0.2s' }}>{link.desc}</p>
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

interface Props { isOpen: boolean; onToggle: () => void }

export default function Sidebar({ isOpen, onToggle }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{ width: isOpen ? '288px' : '80px', minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', flexShrink: 0, overflow: 'hidden' }}>

      {/* Logo + Hamburger */}
      <div className={`flex items-center h-16 border-b border-slate-800 px-4 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">Sistema de</p>
              <p className="text-blue-400 text-sm font-bold leading-none mt-1">Egresados</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          title={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '5px', width: '40px', height: '40px', borderRadius: '12px', border: 'none',
            background: 'rgba(255,255,255,0.06)', cursor: 'pointer', flexShrink: 0,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >
          {isOpen ? (
            /* X icon cuando está abierto */
            <svg style={{ width: '18px', height: '18px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* 3 líneas cuando está cerrado */
            <>
              <span style={{ width: '18px', height: '2px', background: '#94a3b8', borderRadius: '2px', transition: 'all 0.2s' }} />
              <span style={{ width: '14px', height: '2px', background: '#94a3b8', borderRadius: '2px', transition: 'all 0.2s' }} />
              <span style={{ width: '18px', height: '2px', background: '#94a3b8', borderRadius: '2px', transition: 'all 0.2s' }} />
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
        {isOpen && (
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-3 pb-3">Navegación</p>
        )}
        {links.map(link => (
          <NavItem key={link.to} link={link} isOpen={isOpen} />
        ))}
      </nav>

      {/* User footer */}
      <div className={`p-2 border-t border-slate-800 ${!isOpen && 'flex flex-col items-center gap-1'}`}>
        {isOpen ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" className="text-slate-500 hover:text-red-400 transition-colors p-1.5">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
