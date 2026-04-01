import { createContext, useContext, useState, type ReactNode } from 'react'

interface Graduate {
  id: number
  first_name: string
  last_name: string
  email: string
  program_id: number
}

interface StudentAuthContextType {
  graduate: Graduate | null
  token: string | null
  isAuthenticated: boolean
  loginGraduate: (token: string, graduate: Graduate) => void
  logout: () => void
}

const StudentAuthContext = createContext<StudentAuthContextType>({} as StudentAuthContextType)

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('graduate_token'))
  const [graduate, setGraduate] = useState<Graduate | null>(() => {
    const saved = localStorage.getItem('graduate_user')
    return saved ? JSON.parse(saved) : null
  })

  const loginGraduate = (token: string, graduate: Graduate) => {
    localStorage.setItem('graduate_token', token)
    localStorage.setItem('graduate_user', JSON.stringify(graduate))
    setToken(token)
    setGraduate(graduate)
  }

  const logout = () => {
    localStorage.removeItem('graduate_token')
    localStorage.removeItem('graduate_user')
    setToken(null)
    setGraduate(null)
  }

  return (
    <StudentAuthContext.Provider value={{ graduate, token, isAuthenticated: !!token, loginGraduate, logout }}>
      {children}
    </StudentAuthContext.Provider>
  )
}

export const useStudentAuth = () => useContext(StudentAuthContext)
