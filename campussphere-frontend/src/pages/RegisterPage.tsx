import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Shield, Users, BookOpen, Briefcase, UserCheck, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const ROLE_DETAILS = [
  { value: 'student', label: 'Student', icon: UserCheck, desc: 'Join events, RSVP, explore clubs & resources', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'club_leader', label: 'Club Leader', icon: Users, desc: 'Create events, manage club members & activities', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: 'faculty', label: 'Faculty / Professor', icon: BookOpen, desc: 'Post academic notices & research resources', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'staff', label: 'Campus Staff', icon: Briefcase, desc: 'Manage facilities, announcements & lost items', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { value: 'admin', label: 'Administrator', icon: Shield, desc: 'Full platform control — events, clubs, users', color: 'bg-red-50 border-red-200 text-red-700' },
]

const STEPS = ['Personal Info', 'Role Selection', 'Set Password']

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('student')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateStep = () => {
    if (step === 0) {
      if (!fullName.trim()) return 'Please enter your full name.'
      if (!email.trim() || !email.includes('@')) return 'Please enter a valid institutional email.'
      return null
    }
    if (step === 1) {
      if (!role) return 'Please select a role.'
      return null
    }
    if (step === 2) {
      if (password.length < 6) return 'Password must be at least 6 characters.'
      if (password !== confirm) return 'Passwords do not match.'
      return null
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setError('')
    setStep((s) => s - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateStep()
    if (err) { setError(err); return }
    setIsLoading(true)
    setError('')
    try {
      await register(email, password, fullName, role, department)
      setSuccess(true)
      setTimeout(() => navigate('/'), 1800)
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Registration failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRole = ROLE_DETAILS.find((r) => r.value === role)!

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 text-sm mb-4">
            Welcome to CampusSphere, <strong>{fullName.split(' ')[0]}</strong>. Your{' '}
            <span className="font-semibold capitalize">{role.replace('_', ' ')}</span> account is ready.
          </p>
          <p className="text-xs text-gray-400">Redirecting to your dashboard...</p>
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-[grow_1.8s_linear_forwards]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-100">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl mb-3 shadow-md shadow-blue-200">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CampusSphere</h1>
          <p className="text-gray-500 text-sm mt-0.5">National Institute of Technology — Campus Portal</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-7">
          {STEPS.map((label, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    idx < step
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : idx === step
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {idx < step ? <CheckCircle size={14} /> : idx + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${idx === step ? 'text-gray-800' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${idx < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* STEP 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-0.5">Personal Information</h2>
              <p className="text-xs text-gray-500">Your name and institutional email address</p>
            </div>
            <Input
              id="fullName"
              label="Full Name *"
              type="text"
              placeholder="e.g. Aarav Patel"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="off"
            />
            <Input
              id="email"
              label="Institutional Email *"
              type="email"
              placeholder="student@nit.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
            <div className="space-y-1">
              <label htmlFor="dept" className="block text-sm font-medium text-gray-700">Department</label>
              <select
                id="dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Department (optional)</option>
                <option>Computer Science & Engineering</option>
                <option>Electronics & Communication</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Electrical Engineering</option>
                <option>Information Technology</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Administration / Non-Teaching</option>
              </select>
            </div>
            <Button className="w-full" size="lg" onClick={handleNext}>
              Continue
            </Button>
          </div>
        )}

        {/* STEP 1: Role */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-0.5">Select Your Role</h2>
              <p className="text-xs text-gray-500">Your role determines your permissions on CampusSphere</p>
            </div>
            <div className="space-y-2">
              {ROLE_DETAILS.map(({ value, label, icon: Icon, desc, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setRole(value); setError('') }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                    role === value
                      ? `${color} ring-2 ring-offset-1 ring-blue-500/30`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${role === value ? 'bg-white/60' : 'bg-gray-100'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900">{label}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 truncate">{desc}</div>
                  </div>
                  {role === value && <CheckCircle size={18} className="text-blue-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
              <Button className="flex-1" onClick={handleNext}>Continue</Button>
            </div>
          </div>
        )}

        {/* STEP 2: Password */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-0.5">Set Your Password</h2>
              <p className="text-xs text-gray-500">
                Creating account as{' '}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${selectedRole.color}`}>
                  {selectedRole.label}
                </span>
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between text-gray-700">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="text-gray-400">Email</span>
                <span className="font-medium truncate ml-4">{email}</span>
              </div>
              {department && (
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-400">Dept</span>
                  <span className="font-medium truncate ml-4">{department}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        password.length >= i * 2
                          ? password.length >= 8 ? 'bg-green-500' : 'bg-amber-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input
                id="confirm"
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
                  confirm && password !== confirm
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
                autoComplete="new-password"
              />
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-0.5">Passwords do not match</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" type="button" onClick={handleBack}>
                Back
              </Button>
              <Button className="flex-1" size="lg" type="submit" isLoading={isLoading}>
                Create Account
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
