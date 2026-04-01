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
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo ── */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white">
        <img
          src="/INSIGNIA-ELA.png"
          alt="IESTP Enrique López Albújar"
          style={{ width: '92%', maxWidth: '520px', objectFit: 'contain' }}
        />
      </div>

      {/* ── Panel derecho ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow">🎓</div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Sistema de Egresados</p>
              <p className="text-slate-400 text-xs">IESTP Enrique López Albújar</p>
            </div>
          </div>

          {/* Formulario sin tarjeta */}
          <div className="px-0 py-0">

            {/* Encabezado */}
            <div className="mb-8 sm:mb-16">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 6vw, 38px)', fontWeight: 900, color: '#0f172a', marginBottom: '12px', lineHeight: 1.1 }}>Iniciar sesión</h2>
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>Ingresa tus credenciales para acceder al sistema</p>
            </div>

            {/* Campos */}
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-3">
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ width: '100%', padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white', color: '#1e293b', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="space-y-3">
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ width: '100%', padding: '16px 56px 16px 20px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white', color: '#1e293b', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showPass ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-2xl text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <div style={{ paddingTop: '28px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', background: '#2563eb', color: 'white', fontWeight: 700, padding: '18px 28px', borderRadius: '16px', fontSize: '18px', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.35)', letterSpacing: '0.03em', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : 'Iniciar sesión'}
                </button>
              </div>

            </form>
          </div>

          <p className="text-center text-slate-400 text-xs mt-10 sm:mt-28">
            © {new Date().getFullYear()} IESTP Enrique López Albújar
          </p>
        </div>
      </div>

    </div>
  )
}
