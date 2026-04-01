import api from './client'

export const sendSurveys = async (params?: { program_id?: number; graduation_year?: number }) => {
  const { data } = await api.post('/surveys/send', null, { params })
  return data as {
    total: number
    results: { name: string; email: string; survey_url: string; email_sent: boolean }[]
  }
}

// Endpoints públicos (sin auth)
const BASE = '/api/v1'

export const getSurveyInfo = async (token: string) => {
  const res = await fetch(`${BASE}/surveys/token/${token}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail ?? 'Error al cargar la encuesta')
  }
  return res.json() as Promise<{ graduate_name: string; program_name: string }>
}

export const respondSurvey = async (token: string, data: {
  is_employed: boolean
  company_name?: string
  company_sector?: string
  job_title?: string
  is_career_related?: boolean
  employment_type?: string
  location_city?: string
}) => {
  const res = await fetch(`${BASE}/surveys/token/${token}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail ?? 'Error al enviar la respuesta')
  }
  return res.json() as Promise<{ message: string }>
}
