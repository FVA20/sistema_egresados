import api from './client'

export interface WorkPlan {
  id: number
  title: string
  description: string | null
  content: string | null
  program_id: number
  is_active: boolean
  created_at: string
  file_name: string | null
  file_path: string | null
}

export interface WorkPlanCreate {
  title: string
  description?: string | null
  content?: string | null
  program_id: number
  is_active: boolean
}

export const getWorkPlans = async (): Promise<WorkPlan[]> => {
  const { data } = await api.get<WorkPlan[]>('/work-plans/')
  return data
}

export const getWorkPlansByProgram = async (programId: number): Promise<WorkPlan[]> => {
  const { data } = await api.get<WorkPlan[]>(`/work-plans/by-program/${programId}`)
  return data
}

export const createWorkPlan = async (payload: WorkPlanCreate): Promise<WorkPlan> => {
  const { data } = await api.post<WorkPlan>('/work-plans/', payload)
  return data
}

export const updateWorkPlan = async (id: number, payload: Partial<WorkPlanCreate>): Promise<WorkPlan> => {
  const { data } = await api.put<WorkPlan>(`/work-plans/${id}`, payload)
  return data
}

export const uploadWorkPlanFile = async (id: number, file: File): Promise<WorkPlan> => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<WorkPlan>(`/work-plans/${id}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const deleteWorkPlanFile = async (id: number): Promise<WorkPlan> => {
  const { data } = await api.delete<WorkPlan>(`/work-plans/${id}/file`)
  return data
}

export const deleteWorkPlan = async (id: number): Promise<void> => {
  await api.delete(`/work-plans/${id}`)
}
