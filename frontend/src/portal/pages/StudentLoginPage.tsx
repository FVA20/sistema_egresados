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
    <div className="min-h-screen flex" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white">
        <img
          src="/INSIGNIA-ELA.png"
          alt="IESTP Enrique López Albújar"
          style={{ width: '92%', maxWidth: '520px', objectFit: 'contain' }}
        />
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-16 py-12">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-xl shadow">🎓</div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Portal Egresados</p>
              <p className="text-slate-400 text-xs">IESTP Enrique López Albújar</p>
            </div>
          </div>

          <div className="px-0 py-0">

            {/* Encabezado */}
            <div className="mb-16">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '38px', fontWeight: 900, color: '#0f172a', marginBottom: '12px', lineHeight: 1.1 }}>Portal Egresados</h2>
              <p style={{ fontSize: '17px', color: '#94a3b8', lineHeight: 1.6 }}>Ingresa tu correo o N° DNI y tus apellidos para acceder</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-3">
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Correo o N° DNI
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  style={{ width: '100%', padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white', color: '#1e293b', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="correo@ejemplo.com o 12345678"
                />
              </div>

              <div className="space-y-3">
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Contraseña (apellidos)
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ width: '100%', padding: '16px 56px 16px 20px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white', color: '#1e293b', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Sus apellidos"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors"
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
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  style={{ display: 'block', marginLeft: 'auto', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#00aae4', padding: 0 }}
                >
                  ¿Olvidaste tu clave?
                </button>
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
                  style={{ width: '100%', background: '#00aae4', color: 'white', fontWeight: 700, padding: '18px 28px', borderRadius: '16px', fontSize: '18px', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,170,228,0.35)', letterSpacing: '0.03em', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : 'Ingresar al Portal'}
                </button>
              </div>

            </form>
          </div>

          <p className="text-center text-slate-400 text-xs mt-36">
            © {new Date().getFullYear()} IESTP Enrique López Albújar
          </p>
        </div>
      </div>

      {/* Modal ¿Olvidaste tu clave? */}
      {showHint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px 36px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>

            <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg style={{ width: '32px', height: '32px', color: '#00aae4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>¿Olvidaste tu clave?</h3>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, margin: '0 0 28px' }}>
              Tu clave de acceso al portal son tus <strong style={{ color: '#0f172a' }}>apellidos</strong>.<br />
              Escríbelos tal como están registrados en el sistema.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px' }}>
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
              style={{ width: '100%', padding: '14px', background: '#00aae4', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,170,228,0.35)' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
