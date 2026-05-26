import api from './api'

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role: 'user' | 'admin'
}

export interface AuthResponse {
  token: string
  refresh_token?: string
  expires_in?: number
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials)
  return response as unknown as AuthResponse
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data)
  return response as unknown as AuthResponse
}

export const refreshToken = async (refreshToken: string): Promise<{ token: string; expires_in: number }> => {
  const response = await api.post<{ token: string; expires_in: number }>('/auth/refresh', {
    refreshToken,
  })
  return response as unknown as { token: string; expires_in: number }
}

export const getProfile = async (): Promise<{ user: User }> => {
  const response = await api.get<{ user: User }>('/auth/profile')
  return response as unknown as { user: User }
}

export const updateProfile = async (data: Partial<User>): Promise<{ user: User }> => {
  const response = await api.put<{ user: User }>('/auth/profile', data)
  return response as unknown as { user: User }
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await api.post('/auth/change-password', data)
}
