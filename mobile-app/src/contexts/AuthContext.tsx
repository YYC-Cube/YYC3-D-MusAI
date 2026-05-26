import { User, initializeAuth, useAuthStore } from '@/stores/authStore'
import React, { ReactNode, createContext, useContext, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
