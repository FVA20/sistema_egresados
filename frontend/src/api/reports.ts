import api from './client'
import type { Stats } from '../types'

export const getStats = async () => {
  const { data } = await api.get<Stats>('/reports/stats')
  return data
}

export const exportExcel = async (params?: { program_id?: number; graduation_year?: number; employment_filter?: string }) => {
  const response = await api.get('/reports/export/excel', {
    params,
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'egresados.xlsx')
  document.body.appendChild(link)
  link.click()
  link.remove()
}
