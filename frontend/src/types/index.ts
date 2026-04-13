export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'viewer'
  is_active: boolean
  created_at: string
}

export interface Program {
  id: number
  name: string
  faculty: string
  degree_level: string
  duration_years: number
  active: boolean
}

export interface Graduate {
  id: number
  first_name: string
  last_name: string
  document_number: string
  email: string
  phone?: string
  program_id: number
  program?: Program
  graduation_year: number
  enrollment_year?: number
  photo_url?: string
  linkedin_url?: string
  created_at: string
  updated_at?: string
  last_seen?: string
}

export interface EmploymentRecord {
  id: number
  graduate_id: number
  is_employed: boolean
  company_name?: string
  company_sector?: string
  job_title?: string
  is_career_related?: boolean
  employment_type?: string
  location_city?: string
  location_country?: string
  salary_range?: string
  start_date?: string
  is_current: boolean
  recorded_at: string
}

export interface Stats {
  total_graduates: number
  total_employed: number
  employment_rate: number
  career_related: number
  career_related_rate: number
  not_career_related: number
  not_career_related_rate: number
  by_program: { program: string; total: number }[]
  top_sectors: { sector: string; total: number }[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}
