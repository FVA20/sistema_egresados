import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useStudentAuth } from '../context/StudentAuthContext'
import { loginGraduate } from '../api/student'

export default function StudentLoginPage() {
  const { isAuthenticated } = useStudentAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showHint, setShowHint] = useState(false)

  if (isAuthenticated) return <Navigate to="/portal/inicio" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginGraduate(email, password)
      localStorage.setItem('graduate_token', data.access_token)
      localStorage.setItem('graduate_user', JSON.stringify(data.graduate))
      window.location.href = '/portal/inicio'
    } catch {
      setError('Credenciales incorrectas. Verifique su correo/DNI y apellidos.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <style>{`
        /* ── Móvil: layout vertical ── */
        .portal-login-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .portal-login-hero {
          background: linear-gradient(135deg, #006fa0 0%, #00aae4 60%, #33bfee 100%);
          padding: 56px 32px 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }
        .portal-login-hero::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 48px;
          background: #f1f5f9;
          border-radius: 32px 32px 0 0;
        }
        .portal-login-card {
          background: #f1f5f9;
          flex: 1;
          padding: 0 20px 40px;
        }
        .portal-login-form-box {
          background: white;
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          margin-top: -8px;
        }

        /* ── Desktop: layout horizontal ── */
        @media (min-width: 1024px) {
          .portal-login-wrapper { flex-direction: row; }
          .portal-login-hero {
            width: 50%;
            padding: 0;
            border-radius: 0;
            justify-content: center;
            align-items: center;
          }
          .portal-login-hero::after { display: none; }
          .portal-login-card {
            width: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px 64px;
          }
          .portal-login-form-box {
            width: 100%;
            max-width: 440px;
            background: transparent;
            box-shadow: none;
            border-radius: 0;
            padding: 0;
            margin-top: 0;
          }
          .portal-hero-img { display: block !important; }
          .portal-hero-mobile { display: none !important; }
          .portal-login-title { font-size: 36px !important; }
        }
      `}</style>

      <div className="portal-login-wrapper">

        {/* ── Encabezado / Hero ── */}
        <div className="portal-login-hero">

          {/* Desktop: imagen insignia */}
          <img
            className="portal-hero-img"
            src="/INSIGNIA-ELA.png"
            alt="IESTP Enrique López Albújar"
            style={{ display: 'none', width: '88%', maxWidth: '480px', objectFit: 'contain' }}
          />

          {/* Móvil: branding */}
          <div className="portal-hero-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '24px',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
              </svg>
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, margin: 0 }}>
                Portal Egresados
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '6px' }}>
                IESTP Enrique López Albújar
              </p>
            </div>
          </div>

        </div>

        {/* ── Formulario ── */}
        <div className="portal-login-card">
          <div className="portal-login-form-box">

            {/* Título */}
            <div style={{ marginBottom: '28px' }}>
              <h2
                className="portal-login-title"
                style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', lineHeight: 1.2 }}
              >
                Bienvenido
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                Ingresa tu correo o N° DNI y tus apellidos para acceder
              </p>
            </div>

            {/* Campos */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Correo o N° DNI
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="correo@ejemplo.com o 12345678"
                  style={{
                    width: '100%', padding: '14px 18px',
                    border: '1.5px solid #e2e8f0', borderRadius: '14px',
                    background: '#f8fafc', color: '#1e293b',
                    fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contraseña (apellidos)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Sus apellidos"
                    style={{
                      width: '100%', padding: '14px 52px 14px 18px',
                      border: '1.5px solid #e2e8f0', borderRadius: '14px',
                      background: '#f8fafc', color: '#1e293b',
                      fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex' }}
                  >
                    {showPass ? (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  style={{ display: 'block', marginLeft: 'auto', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#00aae4', padding: 0 }}
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '14px 16px', borderRadius: '14px', fontSize: '14px' }}>
                  <svg style={{ width: '16px', height: '16px', marginTop: '1px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', marginTop: '8px',
                  background: 'linear-gradient(135deg, #00aae4, #006fa0)',
                  color: 'white', fontWeight: 700,
                  padding: '16px 28px', borderRadius: '14px',
                  fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(0,170,228,0.4)',
                  opacity: loading ? 0.7 : 1,
                  letterSpacing: '0.02em',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Verificando...
                  </span>
                ) : 'Ingresar al Portal'}
              </button>

            </form>

            <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '12px', marginTop: '28px' }}>
              © {new Date().getFullYear()} IESTP Enrique López Albújar
            </p>

          </div>
        </div>

      </div>

      {/* Modal ¿Olvidaste tu clave? */}
      {showHint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px 32px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>

            <div style={{ width: '64px', height: '64px', background: '#e0f6fd', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg style={{ width: '32px', height: '32px', color: '#00aae4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>¿Olvidaste tu clave?</h3>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, margin: '0 0 24px' }}>
              Tu clave de acceso al portal son tus <strong style={{ color: '#0f172a' }}>apellidos</strong>.<br />
              Escríbelos tal como están registrados en el sistema.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Ejemplo</p>
              <p style={{ fontSize: '15px', color: '#334155', margin: 0 }}>
                Si te llamas <strong>Juan García López</strong>,<br />tu clave es: <strong style={{ color: '#00aae4' }}>Garcia Lopez</strong>
              </p>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 }}>
              Si tienes problemas para acceder, comunícate con la institución a través de la sección <strong style={{ color: '#475569' }}>Contáctanos</strong>.
            </p>

            <button
              onClick={() => setShowHint(false)}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #00aae4, #006fa0)', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,170,228,0.35)' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
