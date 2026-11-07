import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string, role?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('campussphere_token')
    const storedUser = localStorage.getItem('campussphere_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { access_token, user: userData } = response.data
    localStorage.setItem('campussphere_token', access_token)
    localStorage.setItem('campussphere_user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
  }

  const register = async (email: string, password: string, full_name: string, role: string = 'student') => {
    await api.post('/api/auth/register', { email, password, full_name, role })
  }

  const logout = () => {
    localStorage.removeItem('campussphere_token')
    localStorage.removeItem('campussphere_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAdmin: user?.role === 'admin', isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
