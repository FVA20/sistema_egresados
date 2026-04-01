import api from './client'
import type { Program } from '../types'

export const getPrograms = async () => {
  const { data } = await api.get<Program[]>('/programs/')
  return data
}

export const createProgram = async (program: Omit<Program, 'id'>) => {
  const { data } = await api.post<Program>('/programs/', program)
  return data
}

export const updateProgram = async (id: number, program: Partial<Program>) => {
  const { data } = await api.put<Program>(`/programs/${id}`, program)
  return data
}

export const deleteProgram = async (id: number) => {
  await api.delete(`/programs/${id}`)
}
