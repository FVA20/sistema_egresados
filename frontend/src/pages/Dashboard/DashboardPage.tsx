import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getStats } from '../../api/reports'
import type { Stats } from '../../types'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

/* ── Animación count-up ── */
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const prevTarget = useRef(0)
  useEffect(() => {
    const start = prevTarget.current
    const diff = target - start
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(start + diff * ease))
      if (progress >= 1) { prevTarget.current = target; clearInterval(timer) }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

/* ── Tarjeta KPI ── */
function StatCard({ label, value, sub, icon, gradient, textColor, isPercent = false }: {
  label: string; value: number; sub: string;
  icon: React.ReactNode; gradient: string; textColor: string; isPercent?: boolean
}) {
  const animated = useCountUp(value)
  return (
    <div
      className="dash-stat-card bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center" style={{ gap: '18px', marginBottom: '24px' }}>
        <div
          className={`rounded-2xl flex items-center justify-center flex-shrink-0 ${gradient}`}
          style={{ width: '60px', height: '60px' }}
        >
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-800" style={{ fontSize: '15px', lineHeight: '1.3' }}>{label}</p>
          <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '5px' }}>{sub}</p>
        </div>
      </div>
      <p className={`dash-stat-number font-black leading-none tabular-nums ${textColor}`}>
        {animated}{isPercent ? '%' : ''}
      </p>
    </div>
  )
}

/* ── Página ── */
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = () => {
    getStats()
      .then(data => { setStats(data); setLastUpdate(new Date()) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 8000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium" style={{ fontSize: '16px' }}>Cargando estadísticas...</p>
      </div>
    </div>
  )
  if (!stats) return null

  const unemployed = stats.total_graduates - stats.total_employed
  const outsideCareer = Math.max(0, stats.employment_rate - stats.career_related_rate)
  const sectorTotal = stats.top_sectors.reduce((acc, s) => acc + s.total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      <style>{`
        .dash-banner-inner { padding: 52px 72px; }
        .dash-banner-title { font-size: 46px; }
        .dash-stat-card { padding: 28px 32px; }
        .dash-stat-number { font-size: 50px; }
        .dash-inner-card { padding: 40px 44px; }
        @media (max-width: 640px) {
          .dash-banner-inner { padding: 28px 24px; }
          .dash-banner-title { font-size: 28px; }
          .dash-stat-card { padding: 20px 20px; }
          .dash-stat-number { font-size: 36px; }
          .dash-inner-card { padding: 20px 20px; }
        }
      `}</style>

      {/* ── Banner ── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl overflow-hidden">
        <div
          className="dash-banner-inner flex flex-col sm:flex-row sm:items-center justify-between"
          style={{ gap: '32px' }}
        >
          <div style={{ paddingLeft: '4px' }}>
            <h1 className="dash-banner-title font-black tracking-tight" style={{ lineHeight: 1.1 }}>
              Panel de Control
            </h1>
            <p className="text-blue-200 capitalize" style={{ fontSize: '17px', marginTop: '14px' }}>
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div
            className="flex flex-col items-start sm:items-end flex-shrink-0"
            style={{ gap: '10px', paddingRight: '16px' }}
          >
            <span
              className="inline-flex items-center text-white bg-white/20 border border-white/30 rounded-full font-semibold"
              style={{ gap: '10px', padding: '10px 24px', fontSize: '15px' }}
            >
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              Sistema en línea
            </span>
            <span className="text-blue-200" style={{ fontSize: '13px' }}>
              Actualizado: {lastUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style={{ gap: '24px' }}>
        <StatCard
          label="Total Egresados" value={stats.total_graduates}
          sub="Registrados en el sistema" textColor="text-blue-700"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>}
        />
        <StatCard
          label="Empleados" value={stats.total_employed}
          sub={`${stats.employment_rate}% del total`} textColor="text-emerald-700"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
        <StatCard
          label="Sin Empleo" value={unemployed}
          sub={`${unemployed > 0 ? (100 - stats.employment_rate).toFixed(1) : 0}% del total`}
          textColor="text-amber-700" gradient="bg-gradient-to-br from-amber-400 to-amber-500"
          icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
        />
        <StatCard
          label="Tasa de Empleabilidad" value={stats.employment_rate}
          sub="Del total de egresados" textColor="text-cyan-700"
          gradient="bg-gradient-to-br from-cyan-500 to-cyan-600" isPercent
          icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
        <StatCard
          label="Trabajan en su Carrera" value={stats.career_related}
          sub={`${stats.career_related_rate}% de los empleados`} textColor="text-purple-700"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
        />
        <StatCard
          label="Fuera de su Carrera" value={stats.not_career_related}
          sub={`${stats.not_career_related_rate}% de los empleados`} textColor="text-rose-700"
          gradient="bg-gradient-to-br from-rose-500 to-rose-600"
          icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>}
        />
      </div>

      {/* ── Indicadores + Barra ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5" style={{ gap: '24px' }}>

        {/* Indicadores */}
        <div className="dash-inner-card xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900" style={{ fontSize: '18px', marginBottom: '6px' }}>
            Indicadores de Empleabilidad
          </h2>
          <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '36px' }}>
            Sobre el total de egresados registrados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {[
              { label: 'Tasa de Empleabilidad', pct: stats.employment_rate,     color: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' },
              { label: 'En su Carrera',          pct: stats.career_related_rate, color: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9' },
              { label: 'Fuera de su Carrera',    pct: outsideCareer,             color: '#f59e0b', bg: '#fffbeb', text: '#b45309' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="font-semibold text-slate-700" style={{ fontSize: '14px' }}>{item.label}</span>
                  <span className="font-black rounded-lg" style={{ fontSize: '13px', padding: '4px 12px', background: item.bg, color: item.text }}>
                    {item.pct}%
                  </span>
                </div>
                <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica de barras */}
        <div className="dash-inner-card xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h2 className="font-bold text-slate-900" style={{ fontSize: '18px', marginBottom: '6px' }}>
                Egresados por Programa
              </h2>
              <p className="text-slate-400" style={{ fontSize: '13px' }}>Distribución por carrera académica</p>
            </div>
            <span className="font-bold text-slate-600 bg-slate-100 rounded-xl" style={{ fontSize: '13px', padding: '8px 16px' }}>
              {stats.total_graduates} total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.by_program} barSize={28} barCategoryGap="40%" margin={{ top: 4, right: 4, left: 0, bottom: 90 }}>
              <XAxis
                dataKey="program"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={(props) => {
                  const { x, y, payload } = props
                  const words: string[] = payload.value.split(' ')
                  const lines: string[] = []
                  let current = ''
                  for (const word of words) {
                    const test = current ? `${current} ${word}` : word
                    if (test.length > 14) { lines.push(current); current = word }
                    else current = test
                  }
                  if (current) lines.push(current)
                  return (
                    <g transform={`translate(${x},${y})`}>
                      {lines.map((line, i) => (
                        <text key={i} x={0} y={0} dy={14 + i * 14} textAnchor="middle" fill="#94a3b8" fontSize={11}>
                          {line}
                        </text>
                      ))}
                    </g>
                  )
                }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: 13 }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="total" name="Egresados" radius={[8, 8, 0, 0]}>
                {stats.by_program.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Pie + Accesos rápidos ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5" style={{ gap: '24px' }}>

        {/* Pie chart */}
        <div className="dash-inner-card xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h2 className="font-bold text-slate-900" style={{ fontSize: '18px' }}>Sectores Laborales</h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '99px' }}>
              <span style={{ width: '7px', height: '7px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              En vivo
            </span>
          </div>
          <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '24px' }}>
            Principales rubros de los egresados empleados
          </p>
          {stats.top_sectors.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px' }}>
              <svg className="w-14 h-14 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <p className="text-slate-400" style={{ fontSize: '14px' }}>Sin datos aún</p>
              <p className="text-slate-300" style={{ fontSize: '12px', marginTop: '6px' }}>Registra empleabilidad con sector</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.top_sectors}
                    dataKey="total"
                    nameKey="sector"
                    cx="50%" cy="50%"
                    outerRadius={88} innerRadius={52}
                    paddingAngle={3}
                  >
                    {stats.top_sectors.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                    formatter={(value) => {
                      const num = Number(value)
                      return [`${num} egresados (${sectorTotal > 0 ? Math.round(num / sectorTotal * 100) : 0}%)`, 'Sector']
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.top_sectors.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <span className="text-slate-700 flex-1 truncate" style={{ fontSize: '13px', fontWeight: 500 }}>
                      {s.sector ?? 'Sin sector'}
                    </span>
                    <span className="font-semibold text-slate-400" style={{ fontSize: '12px' }}>
                      {sectorTotal > 0 ? Math.round(s.total / sectorTotal * 100) : 0}%
                    </span>
                    <span className="font-bold text-slate-800" style={{ fontSize: '13px', minWidth: '24px', textAlign: 'right' }}>{s.total}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="dash-inner-card xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900" style={{ fontSize: '18px', marginBottom: '6px' }}>
            Accesos Rápidos
          </h2>
          <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '28px' }}>
            Navega a las secciones principales
          </p>
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            {[
              { label: 'Registrar Egresado', sub: 'Agregar nuevo registro', href: '/graduates',  bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> },
              { label: 'Ver Empleabilidad',  sub: 'Historial laboral',      href: '/employment', bg: 'linear-gradient(135deg,#10b981,#047857)', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
              { label: 'Programas',          sub: 'Carreras y facultades',  href: '/programs',   bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
              { label: 'Exportar Reporte',   sub: 'Descargar Excel',        href: '/reports',    bg: 'linear-gradient(135deg,#f59e0b,#b45309)', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> },
            ].map(item => (
              <Link
                key={item.label} to={item.href}
                className="text-white rounded-2xl flex items-center transition-all active:scale-95 hover:-translate-y-0.5"
                style={{ background: item.bg, padding: '22px 24px', gap: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', textDecoration: 'none' }}
              >
                <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold" style={{ fontSize: '14px', lineHeight: 1.2 }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '5px' }}>{item.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
