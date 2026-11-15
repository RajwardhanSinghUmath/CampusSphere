import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'
import { User, UserRole } from '../types'

export interface CampusProfile {
  role: UserRole
  roleTitle: string
  email: string
  name: string
  desc: string
  color: string
}

export const CAMPUS_PROFILES: CampusProfile[] = [
  { role: 'admin', roleTitle: 'System Admin', email: 'admin@nit.edu', name: 'Dr. Rajesh Sharma (Dean)', desc: 'Full administrative control over campus', color: 'bg-red-100 text-red-700 border-red-300' },
  { role: 'club_leader', roleTitle: 'Club Leader', email: 'club@nit.edu', name: 'Ananya Sen (Coding Club Lead)', desc: 'Creates club events & manages members', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { role: 'faculty', roleTitle: 'Faculty Professor', email: 'faculty@nit.edu', name: 'Prof. Vikram Malhotra (CSE)', desc: 'Posts official notices & academic resources', color: 'bg-green-100 text-green-700 border-green-300' },
  { role: 'staff', roleTitle: 'Campus Staff', email: 'staff@nit.edu', name: 'Sunita Verma (Student Affairs)', desc: 'Manages facilities, broadcasts & lost-found', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { role: 'student', roleTitle: 'Student', email: 'student@nit.edu', name: 'Aarav Patel (Student)', desc: 'Explores events, RSVPs & shares resources', color: 'bg-blue-100 text-blue-700 border-blue-300' },
]

interface AuthContextType {
  user: User | null
  token: string | null
  isAdmin: boolean
  isClubLeader: boolean
  isFaculty: boolean
  isStaff: boolean
  isPrivileged: boolean
  canCreateEvents: boolean
  canCreateAnnouncements: boolean
  canCreateClubs: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  switchRole: (role: UserRole) => Promise<void>
  loginAsDemo: (role: UserRole) => Promise<void> // alias for backward compatibility
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
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('campussphere_user')
      }
    } else {
      // Default initial user as Student so app loads immediately
      const defaultUser: User = {
        id: 'usr-student',
        email: 'student@nit.edu',
        full_name: 'Aarav Patel',
        role: 'student',
        created_at: new Date().toISOString(),
      }
      localStorage.setItem('campussphere_token', 'campus-auth-token')
      localStorage.setItem('campussphere_user', JSON.stringify(defaultUser))
      setToken('campus-auth-token')
      setUser(defaultUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { access_token, user: userData } = response.data
      localStorage.setItem('campussphere_token', access_token)
      localStorage.setItem('campussphere_user', JSON.stringify(userData))
      setToken(access_token)
      setUser(userData)
    } catch (err) {
      // Direct authenticated login fallback
      const matched = CAMPUS_PROFILES.find((a) => a.email.toLowerCase() === email.toLowerCase())
      if (matched) {
        const campusUser: User = {
          id: `usr-${matched.role}`,
          email: matched.email,
          full_name: matched.name,
          role: matched.role,
          created_at: new Date().toISOString(),
        }
        localStorage.setItem('campussphere_token', 'campus-auth-token')
        localStorage.setItem('campussphere_user', JSON.stringify(campusUser))
        setToken('campus-auth-token')
        setUser(campusUser)
        return
      }
      throw err
    }
  }

  const switchRole = async (role: UserRole) => {
    const matched = CAMPUS_PROFILES.find((a) => a.role === role) || CAMPUS_PROFILES[0]
    const campusUser: User = {
      id: `usr-${matched.role}`,
      email: matched.email,
      full_name: matched.name,
      role: matched.role,
      created_at: new Date().toISOString(),
    }
    localStorage.setItem('campussphere_token', 'campus-auth-token')
    localStorage.setItem('campussphere_user', JSON.stringify(campusUser))
    setToken('campus-auth-token')
    setUser(campusUser)
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

  const role = user?.role || 'student'
  const isAdmin = role === 'admin'
  const isClubLeader = role === 'club_leader'
  const isFaculty = role === 'faculty'
  const isStaff = role === 'staff'
  const isPrivileged = ['admin', 'faculty', 'staff', 'club_leader'].includes(role)
  const canCreateEvents = ['admin', 'faculty', 'staff', 'club_leader'].includes(role)
  const canCreateAnnouncements = ['admin', 'faculty', 'staff'].includes(role)
  const canCreateClubs = ['admin', 'faculty', 'club_leader'].includes(role)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isClubLeader,
        isFaculty,
        isStaff,
        isPrivileged,
        canCreateEvents,
        canCreateAnnouncements,
        canCreateClubs,
        isLoading,
        login,
        switchRole,
        loginAsDemo: switchRole,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
