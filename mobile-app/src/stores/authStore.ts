import api from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'

export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  role?: string
  created_at?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  actions: {
    login: (email: string, password: string) => Promise<void>
    register: (email: string, username: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshAuthToken: () => Promise<void>
    clearError: () => void
    setLoading: (loading: boolean) => void
    updateProfile: (data: { username?: string; bio?: string; avatar_url?: string }) => Promise<void>
    uploadAvatar: (fileUri: string) => Promise<string>
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  actions: {
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null })

      try {
        const response = await api.post<{
          token: string
          user: User
          refresh_token?: string
        }>('/auth/login', { email, password })
        const { token, user, refresh_token } = response.data

        // Store tokens securely using SecureStore
        await SecureStore.setItemAsync('auth_token', token)
        if (refresh_token) {
          await SecureStore.setItemAsync('refresh_token', refresh_token)
        }

        // Store user data (non-sensitive) in AsyncStorage
        await AsyncStorage.setItem('user_data', JSON.stringify(user))

        set({
          user,
          token,
          refreshToken: refresh_token || null,
          isAuthenticated: true,
          isLoading: false,
        })

      } catch (error: unknown) {
        const message =
          (error instanceof Error ? error.message : '登录失败，请检查网络连接')

        set({
          error: message,
          isLoading: false,
        })

        throw error
      }
    },

    register: async (email: string, username: string, password: string) => {
      set({ isLoading: true, error: null })

      try {
        const response = await api.post<{
          token: string
          user: User
          refresh_token?: string
        }>('/auth/register', {
          email,
          username,
          password,
        })

        const { token, user, refresh_token } = response.data

        // Store tokens securely using SecureStore
        await SecureStore.setItemAsync('auth_token', token)
        if (refresh_token) {
          await SecureStore.setItemAsync('refresh_token', refresh_token)
        }

        // Store user data (non-sensitive) in AsyncStorage
        await AsyncStorage.setItem('user_data', JSON.stringify(user))

        set({
          user,
          token,
          refreshToken: refresh_token || null,
          isAuthenticated: true,
          isLoading: false,
        })

      } catch (error: unknown) {
        const message =
          (error instanceof Error ? error.message : '注册失败，请稍后重试')

        set({
          error: message,
          isLoading: false,
        })

        throw error
      }
    },

    logout: async () => {
      try {
        // Call logout endpoint to invalidate server-side session
        if (get().token) {
          await api.post('/auth/logout').catch(() => { })
        }
      } catch (error) {
        console.error('Logout API call failed:', error)
      } finally {
        // Clear all stored data regardless of API success
        await SecureStore.deleteItemAsync('auth_token')
        await SecureStore.deleteItemAsync('refresh_token')
        await AsyncStorage.removeItem('user_data')

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      }
    },

    refreshAuthToken: async () => {
      const refreshToken = get().refreshToken

      if (!refreshToken) {
        get().actions.logout()
        return
      }

      try {
        const response = await api.post<{
          token: string
          refresh_token?: string
        }>('/auth/refresh', {
          refresh_token: refreshToken,
        })

        const { token, refresh_token: newRefreshToken } = response.data

        await SecureStore.setItemAsync('auth_token', token)
        if (newRefreshToken) {
          await SecureStore.setItemAsync('refresh_token', newRefreshToken)
        }

        set({
          token,
          refreshToken: newRefreshToken || refreshToken,
        })

      } catch (error) {
        console.error('Token refresh failed:', error)
        get().actions.logout()
      }
    },

    clearError: () => set({ error: null }),

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    updateProfile: async (data: { username?: string; bio?: string; avatar_url?: string }) => {
      set({ isLoading: true, error: null })

      try {
        const response = await api.put<User>('/auth/profile', data)
        const updatedUser = response.data

        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser))

        set({
          user: updatedUser,
          isLoading: false,
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '更新失败'
        set({ error: message, isLoading: false })
        throw error
      }
    },

    uploadAvatar: async (fileUri: string) => {
      set({ isLoading: true, error: null })

      try {
        const response = await api.uploadFile<{ avatar_url: string }>('/auth/avatar', fileUri, 'avatar')
        const { avatar_url } = response.data

        // Update user with new avatar URL
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar_url }
          await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser))
          set({ user: updatedUser, isLoading: false })
        }

        return avatar_url
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '上传失败'
        set({ error: message, isLoading: false })
        throw error
      }
    },
  },
}))

// Initialize auth state from storage on app startup
export async function initializeAuth() {
  try {
    const token = await SecureStore.getItemAsync('auth_token')
    const userData = await AsyncStorage.getItem('user_data')
    const refreshToken = await SecureStore.getItemAsync('refresh_token')

    if (token && userData) {
      const user = JSON.parse(userData)

      useAuthStore.setState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
      })
    }
  } catch (error) {
    console.error('Failed to initialize auth state:', error)
  }
}
