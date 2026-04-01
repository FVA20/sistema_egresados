import api from './client'
import type { TokenResponse } from '../types'

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}
