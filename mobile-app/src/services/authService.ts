import apiService from './api'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface User {
  id: string
  email: string
  username: string
  avatar_url: string
  display_name: string
  bio: string
  followers_count: number
  following_count: number
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  display_name: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<{ user: User; tokens: AuthTokens }>('/auth/login', credentials)

    const { user, tokens } = response.data

    // Store tokens securely
    await SecureStore.setItemAsync('auth_token', tokens.access_token)
    await SecureStore.setItemAsync('refresh_token', tokens.refresh_token)

    // Store user data
    await AsyncStorage.setItem('user_data', JSON.stringify(user))

    return { user, tokens }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<{ user: User; tokens: AuthTokens }>('/auth/register', data)

    const { user, tokens } = response.data

    // Store tokens securely
    await SecureStore.setItemAsync('auth_token', tokens.access_token)
    await SecureStore.setItemAsync('refresh_token', tokens.refresh_token)

    // Store user data
    await AsyncStorage.setItem('user_data', JSON.stringify(user))

    return { user, tokens }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout')
    } finally {
      // Clear all stored data regardless of API success
      await SecureStore.deleteItemAsync('auth_token')
      await SecureStore.deleteItemAsync('refresh_token')
      await AsyncStorage.removeItem('user_data')
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', data)
    const user = response.data

    // Update stored user data
    await AsyncStorage.setItem('user_data', JSON.stringify(user))

    return user
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    })
  }
}

export const authService = new AuthService()
export default authService
