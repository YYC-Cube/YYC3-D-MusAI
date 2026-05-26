import type { User } from '@/services/authService'
import * as authService from '@/services/authService'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  actions: {
    login: (email: string, password: string) => Promise<void>
    register: (email: string, username: string, password: string) => Promise<void>
    logout: () => void
    fetchProfile: () => Promise<void>
    updateProfile: (data: Partial<User>) => Promise<void>
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>
    refreshAccessToken: () => Promise<boolean>
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      actions: {
        login: async (email: string, password: string) => {
          set({ isLoading: true })

          try {
            const { token, refresh_token, user } = await authService.login({ email, password })

            localStorage.setItem('auth_token', token)
            if (refresh_token) {
              localStorage.setItem('refresh_token', refresh_token)
            }

            set({
              user,
              token,
              refreshToken: refresh_token || null,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error: unknown) {
            set({ isLoading: false })
            throw error
          }
        },

        register: async (email: string, username: string, password: string) => {
          set({ isLoading: true })

          try {
            const { token, refresh_token, user } = await authService.register({ email, username, password })

            localStorage.setItem('auth_token', token)
            if (refresh_token) {
              localStorage.setItem('refresh_token', refresh_token)
            }

            set({
              user,
              token,
              refreshToken: refresh_token || null,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error: unknown) {
            set({ isLoading: false })
            throw error
          }
        },

        logout: () => {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('token_expires_at')

          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          })
        },

        fetchProfile: async () => {
          try {
            const { user } = await authService.getProfile()
            set({ user, isAuthenticated: true })
          } catch (error) {
            console.error('获取用户信息失败:', error)
          }
        },

        updateProfile: async (data: Partial<User>) => {
          try {
            const { user } = await authService.updateProfile(data)
            set({ user })
          } catch (error: unknown) {
            throw error
          }
        },

        changePassword: async (oldPassword: string, newPassword: string) => {
          set({ isLoading: true })
          try {
            await authService.changePassword({ oldPassword, newPassword })
            set({ isLoading: false })
          } catch (error: unknown) {
            set({ isLoading: false })
            throw error
          }
        },

        refreshAccessToken: async () => {
          const refreshToken = get().refreshToken

          if (!refreshToken) {
            get().actions.logout()
            return false
          }

          try {
            const { token, expires_in } = await authService.refreshToken(refreshToken)

            localStorage.setItem('auth_token', token)
            localStorage.setItem('token_expires_at', String(Date.now() + expires_in * 1000))

            set({ token })
            return true
          } catch (error) {
            console.error('刷新令牌失败:', error)
            get().actions.logout()
            return false
          }
        },
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
