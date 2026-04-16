import axios from 'axios'

const studentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1',
})

studentApi.interceptors.request.use(config => {
  const token = localStorage.getItem('graduate_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('graduate_token')
      localStorage.removeItem('graduate_user')
      window.location.href = '/portal/login'
    }
    return Promise.reject(error)
  }
)

export async function loginGraduate(email: string, password: string) {
  const res = await studentApi.post('/auth/graduate-login', { email, password })
  return res.data as { access_token: string; graduate: { id: number; first_name: string; last_name: string; email: string; program_id: number } }
}

export async function getPrograms() {
  const res = await studentApi.get('/programs/')
  return res.data as { id: number; name: string; faculty: string; degree_level: string; duration_years: number; active: boolean }[]
}

export async function getWorkPlansByProgram(programId: number) {
  const res = await studentApi.get(`/work-plans/by-program/${programId}`)
  return res.data as { id: number; title: string; description: string | null; content: string | null; program_id: number; is_active: boolean; created_at: string; file_name: string | null; file_path: string | null }[]
}

export async function getPublishedNews() {
  const res = await studentApi.get('/news/')
  const all = res.data as { id: number; title: string; summary: string | null; content: string | null; category: string | null; image_path: string | null; link: string | null; file_name: string | null; file_path: string | null; is_published: boolean; created_at: string }[]
  return all.filter(n => n.is_published)
}

export async function getContactInfo() {
  const res = await studentApi.get('/contact/')
  return res.data as { id: number; key: string; label: string; title: string; description: string }[]
}

export async function getMyPostulations() {
  const res = await studentApi.get('/postulations/my')
  return res.data as { id: number; workplan_id: number; status: string }[]
}

export async function createPostulation(workplan_id: number, message?: string) {
  const res = await studentApi.post('/postulations/', { workplan_id, message })
  return res.data as { id: number; status: string }
}

export default studentApi
