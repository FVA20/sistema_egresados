import { useEffect, useRef, useState } from 'react'
import { getNews, createNews, updateNews, deleteNews, uploadNewsImage, deleteNewsImage, uploadNewsFile, deleteNewsFile } from '../../api/news'
import { getGraduates } from '../../api/graduates'
import type { NewsItem } from '../../api/news'

const CATEGORIES = ['Noticia', 'Convocatoria', 'Evento', 'Comunicado']

const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Noticia:      { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Convocatoria: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Evento:       { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  Comunicado:   { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
}

const emptyForm = { title: '', summary: '', content: '', category: 'Noticia', link: '', is_published: true }

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0',
  borderRadius: '12px', fontSize: '14px', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box', color: '#1e293b',
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return { icon: '📄', color: '#ef4444', bg: '#fef2f2', label: 'PDF' }
  if (['doc', 'docx'].includes(ext)) return { icon: '📝', color: '#2563eb', bg: '#eff6ff', label: 'Word' }
  if (['xls', 'xlsx'].includes(ext)) return { icon: '📊', color: '#059669', bg: '#ecfdf5', label: 'Excel' }
  if (['ppt', 'pptx'].includes(ext)) return { icon: '📋', color: '#d97706', bg: '#fffbeb', label: 'PPT' }
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return { icon: '🎬', color: '#7c3aed', bg: '#f5f3ff', label: 'Video' }
  return { icon: '📎', color: '#64748b', bg: '#f8fafc', label: ext.toUpperCase() || 'Archivo' }
}

export default function NewsPage() {
  const [news, setNews]             = useState<NewsItem[]>([])
  const [selected, setSelected]     = useState<NewsItem | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<NewsItem | null>(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [notifying, setNotifying]   = useState(false)
  const [pendingImg, setPendingImg] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const imgRef  = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => getNews().then(setNews)
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setForm(emptyForm)
    setPendingImg(null); setPreviewUrl(null); setPendingFile(null)
    setShowForm(true)
  }

  const openEdit = (item: NewsItem) => {
    setEditing(item)
    setForm({
      title: item.title, summary: item.summary || '',
      content: item.content || '', category: item.category || 'Noticia',
      link: item.link || '', is_published: item.is_published,
    })
    setPendingImg(null); setPendingFile(null)
    setPreviewUrl(item.image_path ? `/uploads/${item.image_path}` : null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false); setEditing(null); setForm(emptyForm)
    setPendingImg(null); setPreviewUrl(null); setPendingFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let item: NewsItem
      const payload = { ...form, link: form.link || null }
      if (editing) {
        item = await updateNews(editing.id, payload)
      } else {
        item = await createNews(payload as any)
      }
      setUploading(true)
      if (pendingImg)  item = await uploadNewsImage(item.id, pendingImg)
      if (pendingFile) item = await uploadNewsFile(item.id, pendingFile)
      setUploading(false)
      await load(); setSelected(item); closeForm()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    await deleteNews(id)
    if (selected?.id === id) setSelected(null)
    await load()
  }

  const handleDeleteImage = async (item: NewsItem) => {
    const updated = await deleteNewsImage(item.id)
    await load()
    if (selected?.id === item.id) setSelected(updated)
    if (editing?.id === item.id) setPreviewUrl(null)
  }

  const handleDeleteFile = async (item: NewsItem) => {
    const updated = await deleteNewsFile(item.id)
    await load()
    if (selected?.id === item.id) setSelected(updated)
  }

  const handleTogglePublish = async (item: NewsItem) => {
    const updated = await updateNews(item.id, { is_published: !item.is_published })
    await load()
    if (selected?.id === item.id) setSelected(updated)
  }

  const handleNotify = async (item: NewsItem) => {
    if (!confirm(`¿Abrir Gmail para notificar a todos los egresados sobre "${item.title}"?`)) return
    setNotifying(true)
    try {
      const graduates = await getGraduates({ limit: 500 })
      const bcc = graduates.map(g => g.email).join(',')
      const subject = `[${item.category || 'Noticia'}] ${item.title} — IESTP Enrique López Albújar`
      const body = [
        item.summary || '',
        '',
        'Ingresa al portal de egresados para ver más información:',
        `${window.location.origin}/portal/login`,
        '',
        '---',
        'IESTP Enrique López Albújar — Portal de Egresados',
      ].join('\n')
      const url = `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(
        `https://mail.google.com/mail/?view=cm&bcc=${encodeURIComponent(bcc)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      )}`
      window.open(url, '_blank')
    } finally {
      setNotifying(false)
    }
  }

  const cat = (c: string | null) => CATEGORY_COLORS[c || 'Noticia'] || CATEGORY_COLORS['Noticia']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      <style>{`
        .news-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
        @media (max-width: 768px) { .news-main-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ paddingLeft: '20px' }}>
          <h1 className="font-black text-slate-900" style={{ fontSize: '36px', lineHeight: 1.1 }}>Noticias</h1>
          <p className="text-slate-500" style={{ fontSize: '15px', marginTop: '8px' }}>Publica y administra las noticias del portal de egresados</p>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', background: '#2563eb', color: 'white', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          Nueva Noticia
        </button>
      </div>

      <div className="news-main-grid">

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {news.length === 0 && !showForm && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
              </div>
              <p className="font-bold text-slate-700" style={{ fontSize: '16px' }}>Sin noticias publicadas</p>
              <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '6px' }}>Crea la primera noticia con el botón de arriba</p>
            </div>
          )}
          {news.map(item => (
            <div key={item.id} onClick={() => setSelected(item)} className="group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer" style={{ borderColor: selected?.id === item.id ? '#2563eb' : '#e2e8f0', overflow: 'hidden' }}>
              {item.image_path && <img src={`/uploads/${item.image_path}`} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: cat(item.category).bg, color: cat(item.category).color, border: `1px solid ${cat(item.category).border}` }}>{item.category}</span>
                    {item.file_name && <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>📎 Adjunto</span>}
                    {item.link && <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>🔗 Link</span>}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: item.is_published ? '#059669' : '#94a3b8' }}>{item.is_published ? '● Publicado' : '○ Oculto'}</span>
                </div>
                <p className="font-bold text-slate-900" style={{ fontSize: '15px', marginBottom: '5px', lineHeight: 1.3 }}>{item.title}</p>
                {item.summary && <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.summary}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <span className="text-slate-400" style={{ fontSize: '12px' }}>{new Date(item.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={e => { e.stopPropagation(); handleTogglePublish(item) }} style={{ padding: '5px 9px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: item.is_published ? '#f1f5f9' : '#ecfdf5', color: item.is_published ? '#64748b' : '#059669', fontSize: '11px', fontWeight: 700 }}>{item.is_published ? 'Ocultar' : 'Publicar'}</button>
                    <button onClick={e => { e.stopPropagation(); openEdit(item) }} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg p-1.5" style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(item.id) }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-1.5" style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Panel derecho */}
        <div>
          {showForm ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div style={{ padding: '20px 28px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <p className="font-bold text-slate-900" style={{ fontSize: '16px' }}>{editing ? 'Editar Noticia' : 'Nueva Noticia'}</p>
                <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '4px' }}>Completa la información de la noticia</p>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Imagen */}
                <div>
                  <label style={labelStyle}>Imagen de portada</label>
                  {previewUrl ? (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={previewUrl} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                      <button type="button" onClick={() => { if (editing?.image_path && !pendingImg) handleDeleteImage(editing); else { setPendingImg(null); setPreviewUrl(editing?.image_path ? `/uploads/${editing.image_path}` : null) } if (imgRef.current) imgRef.current.value = '' }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', color: 'white', padding: '6px', cursor: 'pointer' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => imgRef.current?.click()} style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#f8fafc' }}>
                      <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span className="text-slate-400" style={{ fontSize: '13px' }}>Clic para subir imagen</span>
                      <span className="text-slate-300" style={{ fontSize: '11px' }}>JPG, PNG, GIF, WEBP</span>
                    </div>
                  )}
                  <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingImg(f); setPreviewUrl(URL.createObjectURL(f)) } }} />
                </div>

                {/* Categoría */}
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Título */}
                <div>
                  <label style={labelStyle}>Título *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título de la noticia" style={inputStyle} />
                </div>

                {/* Resumen */}
                <div>
                  <label style={labelStyle}>Resumen</label>
                  <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Breve descripción..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                {/* Contenido */}
                <div>
                  <label style={labelStyle}>Contenido completo</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Detalle completo de la noticia..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                {/* Link */}
                <div>
                  <label style={labelStyle}>🔗 Enlace externo (opcional)</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    placeholder="https://ejemplo.com/más-información"
                    style={inputStyle}
                  />
                </div>

                {/* Archivo adjunto */}
                <div>
                  <label style={labelStyle}>📎 Archivo adjunto (PDF, Word, Excel, Video…)</label>
                  {(pendingFile || (editing?.file_name && !pendingFile)) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      {(() => { const info = fileIcon(pendingFile?.name || editing?.file_name || ''); return <span style={{ fontSize: '22px' }}>{info.icon}</span> })()}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pendingFile?.name || editing?.file_name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {pendingFile ? 'Archivo seleccionado (se subirá al guardar)' : 'Archivo guardado'}
                        </p>
                      </div>
                      <button type="button" onClick={() => { if (!pendingFile && editing?.file_name) handleDeleteFile(editing); setPendingFile(null); if (fileRef.current) fileRef.current.value = '' }} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#f8fafc' }}>
                      <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                      <span className="text-slate-400" style={{ fontSize: '13px' }}>Clic para adjuntar archivo</span>
                      <span className="text-slate-300" style={{ fontSize: '11px' }}>PDF, Word, Excel, PPT, Video — sin límite de tipo</span>
                    </div>
                  )}
                  <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setPendingFile(f) }} />
                </div>

                {/* Publicado toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button type="button" onClick={() => setForm({ ...form, is_published: !form.is_published })} style={{ position: 'relative', width: '48px', height: '28px', borderRadius: '99px', border: 'none', cursor: 'pointer', background: form.is_published ? '#2563eb' : '#cbd5e1', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: '4px', left: '0', width: '20px', height: '20px', background: 'white', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'transform 0.2s', transform: form.is_published ? 'translateX(24px)' : 'translateX(4px)' }} />
                  </button>
                  <span className="font-semibold text-slate-700" style={{ fontSize: '14px' }}>
                    {form.is_published ? 'Publicado (visible en el portal)' : 'Oculto (no visible en el portal)'}
                  </span>
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                  <button type="button" onClick={closeForm} style={{ flex: 1, padding: '13px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: saving ? 0.6 : 1 }}>
                    {saving ? (uploading ? 'Subiendo archivos...' : 'Guardando...') : editing ? 'Guardar Cambios' : 'Publicar Noticia'}
                  </button>
                </div>
              </form>
            </div>

          ) : selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {selected.image_path && <img src={`/uploads/${selected.image_path}`} alt={selected.title} style={{ width: '100%', height: '210px', objectFit: 'cover' }} />}
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', background: cat(selected.category).bg, color: cat(selected.category).color, border: `1px solid ${cat(selected.category).border}` }}>{selected.category}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: selected.is_published ? '#059669' : '#94a3b8' }}>{selected.is_published ? '● Publicado' : '○ Oculto'}</span>
                  <span className="text-slate-400" style={{ fontSize: '12px', marginLeft: 'auto' }}>{new Date(selected.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="font-black text-slate-900" style={{ fontSize: '20px', lineHeight: 1.2, marginBottom: '12px' }}>{selected.title}</h2>
                {selected.summary && <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '14px', fontStyle: 'italic', borderLeft: '3px solid #2563eb', paddingLeft: '14px' }}>{selected.summary}</p>}
                {selected.content && <p className="text-slate-700" style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>{selected.content}</p>}

                {/* Link */}
                {selected.link && (
                  <a href={selected.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', textDecoration: 'none', marginBottom: '12px' }}>
                    <svg style={{ width: '16px', height: '16px', color: '#0284c7', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.link}</span>
                  </a>
                )}

                {/* Archivo adjunto */}
                {selected.file_name && selected.file_path && (() => {
                  const info = fileIcon(selected.file_name)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: info.bg, border: `1px solid ${info.color}22`, borderRadius: '12px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '24px' }}>{info.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.file_name}</p>
                        <p style={{ fontSize: '11px', color: info.color, marginTop: '2px', fontWeight: 600 }}>{info.label}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href={`/uploads/${selected.file_path}`} download={selected.file_name} style={{ padding: '7px 12px', background: '#2563eb', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          Descargar
                        </a>
                        <button onClick={() => handleDeleteFile(selected)} style={{ padding: '7px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button onClick={() => openEdit(selected)} style={{ flex: 1, padding: '11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', background: 'white', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleTogglePublish(selected)} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: 'white', background: selected.is_published ? '#64748b' : '#059669', cursor: 'pointer' }}>
                    {selected.is_published ? 'Ocultar' : 'Publicar'}
                  </button>
                </div>

                {/* Botón notificar egresados */}
                {selected.is_published && (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => handleNotify(selected)}
                      disabled={notifying}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #0891b2, #0e7490)', cursor: notifying ? 'default' : 'pointer', opacity: notifying ? 0.7 : 1, boxShadow: '0 4px 14px rgba(8,145,178,0.35)' }}
                    >
                      {notifying ? (
                        <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Enviando notificaciones...</>
                      ) : (
                        <><svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>Notificar a egresados por correo</>
                      )}
                    </button>

                  </div>
                )}
              </div>
            </div>

          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
              <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
              </div>
              <p className="font-bold text-slate-700" style={{ fontSize: '16px' }}>Selecciona una noticia</p>
              <p className="text-slate-400" style={{ fontSize: '14px', maxWidth: '260px' }}>Haz clic en una noticia para ver su detalle, o crea una nueva</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
