import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Shield, Users, BookOpen, Briefcase, UserCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth, CAMPUS_PROFILES } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { UserRole } from '../types'

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-50 border-red-200 text-red-700 hover:border-red-400',
  club_leader: 'bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400',
  faculty: 'bg-green-50 border-green-200 text-green-700 hover:border-green-400',
  staff: 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400',
  student: 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400',
}

export function LoginPage() {
  const { login, switchRole } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingRole, setLoadingRole] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Invalid credentials. Please verify your campus email and password.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSelect = async (role: UserRole) => {
    setError('')
    setLoadingRole(role)
    try {
      await switchRole(role)
      navigate('/')
    } catch {
      navigate('/')
    } finally {
      setLoadingRole(null)
    }
  }

  const roleIcons: Record<string, any> = {
    admin: Shield,
    club_leader: Users,
    faculty: BookOpen,
    staff: Briefcase,
    student: UserCheck,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-100">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl mb-3 shadow-md shadow-blue-200">
            <GraduationCap className="text-white" size={34} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CampusSphere</h1>
          <p className="text-gray-500 text-sm mt-0.5">National Institute of Technology Campus Portal</p>
        </div>

        {/* Campus Persona Quick Selection */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Campus Personas (Quick Sign-In)
            </span>
            <span className="text-[10px] text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
              No password needed
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CAMPUS_PROFILES.map((acc) => {
              const Icon = roleIcons[acc.role] || UserCheck
              const colorClass = ROLE_COLORS[acc.role] || ROLE_COLORS.student
              const isSelected = loadingRole === acc.role
              return (
                <button
                  key={acc.role}
                  type="button"
                  disabled={isLoading || loadingRole !== null}
                  onClick={() => handleProfileSelect(acc.role)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 bg-white transition-all text-center shadow-sm group cursor-pointer disabled:opacity-60 ${colorClass} ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                >
                  {isSelected ? (
                    <div className="w-4 h-4 mb-1 border-2 border-current rounded-full animate-spin border-t-transparent" />
                  ) : (
                    <Icon size={16} className="mb-1 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs font-semibold leading-tight">{acc.roleTitle}</span>
                  <span className="text-[10px] opacity-70 mt-0.5 capitalize">{acc.role.replace('_', ' ')}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-medium">Or sign in with credentials</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input
            id="email"
            label="Institutional Email"
            type="email"
            placeholder="student@nit.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
          />
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Sign In to CampusSphere
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New to CampusSphere?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Create your account
          </Link>
        </p>
      </div>
    </div>
  )
}
