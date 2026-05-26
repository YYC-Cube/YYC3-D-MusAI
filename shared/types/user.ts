export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role: UserRole
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  token: string
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
