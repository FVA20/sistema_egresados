import api from './client'
import type { EmploymentRecord } from '../types'

export const getEmploymentByGraduate = async (graduateId: number) => {
  const { data } = await api.get<EmploymentRecord[]>(`/employment/graduate/${graduateId}`)
  return data
}

export const createEmployment = async (record: Omit<EmploymentRecord, 'id' | 'recorded_at'>) => {
  const { data } = await api.post<EmploymentRecord>('/employment/', record)
  return data
}

export const updateEmployment = async (id: number, record: Partial<EmploymentRecord>) => {
  const { data } = await api.put<EmploymentRecord>(`/employment/${id}`, record)
  return data
}

export const deleteEmployment = async (id: number) => {
  await api.delete(`/employment/${id}`)
}
