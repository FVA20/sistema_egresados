import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../api/auth'

export default function LoginPage() {
  const { isAuthenticated, loginUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      loginUser(data.access_token, data.user)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Credenciales incorrectas. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <style>{`
        /* ── Móvil: layout vertical ── */
        .login-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .login-hero {
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%);
          padding: 56px 32px 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }
        .login-hero::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 48px;
          background: #f1f5f9;
          border-radius: 32px 32px 0 0;
        }
        .login-card {
          background: #f1f5f9;
          flex: 1;
          padding: 0 20px 40px;
        }
        .login-form-box {
          background: white;
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          margin-top: -8px;
        }

        /* ── Desktop: layout horizontal ── */
        @media (min-width: 1024px) {
          .login-wrapper { flex-direction: row; }
          .login-hero {
            width: 50%;
            padding: 0;
            border-radius: 0;
            justify-content: center;
            align-items: center;
          }
          .login-hero::after { display: none; }
          .login-card {
            width: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px 64px;
          }
          .login-form-box {
            width: 100%;
            max-width: 440px;
            background: transparent;
            box-shadow: none;
            border-radius: 0;
            padding: 0;
            margin-top: 0;
          }
          .login-hero-img { display: block !important; }
          .login-hero-mobile { display: none !important; }
          .login-title { font-size: 36px !important; }
        }
      `}</style>

      <div className="login-wrapper">

        {/* ── Encabezado / Hero ── */}
        <div className="login-hero">

          {/* Desktop: imagen insignia */}
          <img
            className="login-hero-img"
            src="/INSIGNIA-ELA.png"
            alt="IESTP Enrique López Albújar"
            style={{ display: 'none', width: '88%', maxWidth: '480px', objectFit: 'contain' }}
          />

          {/* Móvil: branding */}
          <div className="login-hero-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
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
                Sistema de Egresados
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '6px' }}>
                IESTP Enrique López Albújar
              </p>
            </div>
          </div>

        </div>

        {/* ── Formulario ── */}
        <div className="login-card">
          <div className="login-form-box">

            {/* Título */}
            <div style={{ marginBottom: '28px' }}>
              <h2
                className="login-title"
                style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', lineHeight: 1.2 }}
              >
                Iniciar sesión
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Campos */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
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
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
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
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white', fontWeight: 700,
                  padding: '16px 28px', borderRadius: '14px',
                  fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                  opacity: loading ? 0.7 : 1,
                  letterSpacing: '0.02em',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Verificando...
                  </span>
                ) : 'Ingresar al sistema'}
              </button>

            </form>

            <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '12px', marginTop: '28px' }}>
              © {new Date().getFullYear()} IESTP Enrique López Albújar
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}
