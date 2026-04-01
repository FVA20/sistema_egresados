import React, { useEffect, useState } from 'react'
import api from '../../api/client'

interface ContactItem {
  id: number
  key: string
  label: string
  title: string
  description: string
}

const ICONS: Record<string, React.ReactElement> = {
  horario: (
    <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  direccion: (
    <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  correo: (
    <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0',
  borderRadius: '12px', fontSize: '14px', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box', color: '#0f172a',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
}

export default function ContactPage() {
  const [items, setItems] = useState<ContactItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/contact/').then(r => setItems(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openEdit = (item: ContactItem) => {
    setEditingKey(item.key)
    setForm({ title: item.title, description: item.description })
    setSuccess('')
  }

  const handleSave = async (key: string) => {
    setSaving(true)
    try {
      await api.put(`/contact/${key}`, form)
      setSuccess(key)
      setEditingKey(null)
      load()
    } finally {
      setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div>
        <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Información de Contacto</h1>
        <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>
          Edita los datos que se muestran en la sección "Contáctanos" del portal
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {items.map(item => (
            <div key={item.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Cabecera de la tarjeta */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                    {ICONS[item.key]}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>{item.label}</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.title}</p>
                  </div>
                </div>
                {success === item.key && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '99px' }}>
                    Guardado ✓
                  </span>
                )}
                {editingKey !== item.key && (
                  <button
                    onClick={() => openEdit(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', background: '#2563eb', color: 'white', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
                  >
                    <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Editar
                  </button>
                )}
              </div>

              {/* Vista actual / Formulario */}
              {editingKey === item.key ? (
                <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Título</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Ej: Lunes – Viernes" />
                  </div>
                  <div>
                    <label style={labelStyle}>Descripción</label>
                    <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} placeholder="Ej: 9:00 AM – 5:00 PM" />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                    <button onClick={() => setEditingKey(null)} style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                    <button onClick={() => handleSave(item.key)} disabled={saving} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: saving ? 0.6 : 1 }}>
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px 32px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{item.description}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
