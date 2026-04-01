import api from './client'
import type { Graduate } from '../types'

export const getGraduates = async (params?: {
  search?: string
  program_id?: number
  graduation_year?: number
  skip?: number
  limit?: number
}) => {
  const { data } = await api.get<Graduate[]>('/graduates/', { params })
  return data
}

export const getGraduate = async (id: number) => {
  const { data } = await api.get<Graduate>(`/graduates/${id}`)
  return data
}

export const createGraduate = async (graduate: Omit<Graduate, 'id' | 'created_at' | 'updated_at'>) => {
  const { data } = await api.post<Graduate>('/graduates/', graduate)
  return data
}

export const updateGraduate = async (id: number, graduate: Partial<Graduate>) => {
  const { data } = await api.put<Graduate>(`/graduates/${id}`, graduate)
  return data
}

export const deleteGraduate = async (id: number) => {
  await api.delete(`/graduates/${id}`)
}
