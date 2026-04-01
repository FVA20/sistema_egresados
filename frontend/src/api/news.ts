import api from './client'

export interface NewsItem {
  id: number
  title: string
  summary: string | null
  content: string | null
  category: string | null
  image_name: string | null
  image_path: string | null
  link: string | null
  file_name: string | null
  file_path: string | null
  is_published: boolean
  created_at: string
}

export const getNews = async () => {
  const { data } = await api.get<NewsItem[]>('/news/')
  return data
}

export const createNews = async (payload: Omit<NewsItem, 'id' | 'image_name' | 'image_path' | 'file_name' | 'file_path' | 'created_at'>) => {
  const { data } = await api.post<NewsItem>('/news/', payload)
  return data
}

export const updateNews = async (id: number, payload: Partial<NewsItem>) => {
  const { data } = await api.put<NewsItem>(`/news/${id}`, payload)
  return data
}

export const deleteNews = async (id: number) => {
  await api.delete(`/news/${id}`)
}

export const uploadNewsImage = async (id: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<NewsItem>(`/news/${id}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const deleteNewsImage = async (id: number) => {
  const { data } = await api.delete<NewsItem>(`/news/${id}/image`)
  return data
}

export const uploadNewsFile = async (id: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<NewsItem>(`/news/${id}/upload-file`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const deleteNewsFile = async (id: number) => {
  const { data } = await api.delete<NewsItem>(`/news/${id}/file`)
  return data
}

export const notifyNews = async (id: number) => {
  const { data } = await api.post<{ total: number; sent: number; failed: number; smtp_configured: boolean }>(`/news/${id}/notify`)
  return data
}
