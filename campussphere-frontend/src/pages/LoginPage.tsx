import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Shield, Users, BookOpen, Briefcase, UserCheck, ArrowRight } from 'lucide-react'
import { useAuth, CAMPUS_PROFILES } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { UserRole } from '../types'

export function LoginPage() {
  const { login, switchRole } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Invalid credentials. Please verify your campus email and password.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSelect = async (role: UserRole) => {
    setError('')
    setIsLoading(true)
    try {
      await switchRole(role)
      navigate('/')
    } catch {
      navigate('/')
    } finally {
      setIsLoading(false)
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
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Campus Personas (Quick Sign-In)
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Select to enter</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CAMPUS_PROFILES.map((acc) => {
              const Icon = roleIcons[acc.role] || UserCheck
              return (
                <button
                  key={acc.role}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleProfileSelect(acc.role)}
                  className="flex flex-col items-center p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all text-center shadow-2xs group cursor-pointer"
                >
                  <Icon size={16} className="text-blue-600 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-semibold text-gray-800 leading-tight">{acc.roleTitle}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{acc.role.replace('_', ' ')}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-medium">Or Sign In with Credentials</span>
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
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            spellCheck={false}
          />
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Sign In to CampusSphere
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New to CampusSphere?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register your account
          </Link>
        </p>
      </div>
    </div>
  )
}
