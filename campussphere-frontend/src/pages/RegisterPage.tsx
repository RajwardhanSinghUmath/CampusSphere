import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Shield,
  Users,
  BookOpen,
  Briefcase,
  UserCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
  X,
  Search,
  Tag,
  Check
} from 'lucide-react'
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

const STEPS = ['Personal Info', 'Role Selection', 'Interests', 'Set Password']

const PRESET_INTERESTS: { name: string; category: string }[] = [
  { name: 'Coding & Software Dev', category: 'Tech' },
  { name: 'Artificial Intelligence & ML', category: 'Tech' },
  { name: 'Web & App Development', category: 'Tech' },
  { name: 'Robotics & IoT', category: 'Tech' },
  { name: 'Cyber Security & Ethical Hacking', category: 'Tech' },
  { name: 'Competitive Programming', category: 'Tech' },
  { name: 'Cloud & DevOps', category: 'Tech' },
  { name: 'Data Science & Analytics', category: 'Tech' },
  { name: 'Blockchain & Web3', category: 'Tech' },
  { name: 'UI/UX & Product Design', category: 'Creative' },
  { name: 'Photography & Filmmaking', category: 'Creative' },
  { name: 'Music & Performing Arts', category: 'Creative' },
  { name: 'Graphic Design & 3D Art', category: 'Creative' },
  { name: 'Debate & Public Speaking', category: 'Activities' },
  { name: 'Entrepreneurship & Startups', category: 'Activities' },
  { name: 'Sports & Athletics', category: 'Activities' },
  { name: 'Literature & Creative Writing', category: 'Activities' },
  { name: 'Astronomy & Space Exploration', category: 'Science' },
  { name: 'Social Service & Volunteering', category: 'Activities' },
  { name: 'Mathematics & Algorithms', category: 'Science' },
]

const INTEREST_CATEGORIES = ['All', 'Tech', 'Creative', 'Activities', 'Science']

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('student')
  const [interests, setInterests] = useState<string[]>([
    'Coding & Software Dev',
    'Artificial Intelligence & ML',
  ])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [customInterestInput, setCustomInterestInput] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const toggleInterest = (interestName: string) => {
    setError('')
    if (interests.includes(interestName)) {
      setInterests(interests.filter((i) => i !== interestName))
    } else {
      setInterests([...interests, interestName])
    }
  }

  const handleAddCustomInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = customInterestInput.trim()
    if (!trimmed) return
    if (interests.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already added.`)
      return
    }
    setInterests([...interests, trimmed])
    setCustomInterestInput('')
    setError('')
  }

  const handleRemoveInterest = (interestName: string) => {
    setInterests(interests.filter((i) => i !== interestName))
  }

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
      if (interests.length === 0) return 'Please select or add at least one interest.'
      return null
    }
    if (step === 3) {
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
      await register(email, password, fullName, role, department, interests)
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

  const filteredPresets = PRESET_INTERESTS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    return matchesCategory && matchesSearch
  })

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
          {interests.length > 0 && (
            <div className="mb-4 bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-left">
              <span className="text-xs font-semibold text-blue-900 block mb-1.5 flex items-center gap-1">
                <Sparkles size={13} className="text-blue-600" />
                Registered Interests ({interests.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {interests.map((i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white text-blue-700 border border-blue-200 shadow-2xs"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
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

        {/* STEP 2: Student Interests */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  <Tag className="text-blue-600" size={18} />
                  {role === 'student' ? 'Student Interests' : 'Areas of Interest'}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {interests.length} selected
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {role === 'student'
                  ? 'Select your academic & extracurricular interests to discover relevant clubs, events, and peers'
                  : 'Select topics and areas of interest for your campus profile'}
              </p>
            </div>

            {/* Selected Interests Chips */}
            {interests.length > 0 ? (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Your Chosen Interests:</span>
                  <button
                    type="button"
                    onClick={() => setInterests([])}
                    className="text-[11px] text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-2xs"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:bg-blue-700 rounded-full p-0.5 text-blue-100 hover:text-white"
                        aria-label={`Remove ${interest}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                Choose at least one interest below or type your own custom interest.
              </div>
            )}

            {/* Add Custom Interest input */}
            <form onSubmit={handleAddCustomInterest} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Add custom interest (e.g. Game Dev, Drone Racing)..."
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddCustomInterest()}
                disabled={!customInterestInput.trim()}
                className="flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add</span>
              </Button>
            </form>

            {/* Category tabs & Search */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                  {INTEREST_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter available topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Available Preset Interest Pills */}
            <div className="border border-gray-200 rounded-xl p-3 bg-white max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {filteredPresets.map((item) => {
                  const isSelected = interests.includes(item.name)
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleInterest(item.name)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700 font-semibold border border-blue-300 ring-1 ring-blue-400/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                      }`}
                    >
                      {isSelected ? <Check size={12} className="text-blue-600" /> : <Plus size={12} className="text-gray-400" />}
                      <span>{item.name}</span>
                    </button>
                  )
                })}
                {filteredPresets.length === 0 && (
                  <div className="text-center w-full py-4 text-xs text-gray-400">
                    No matching interests found. Use the field above to add custom ones!
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Password & Confirmation */}
        {step === 3 && (
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
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm space-y-1.5">
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
              <div className="flex justify-between text-gray-700">
                <span className="text-gray-400">Role</span>
                <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
              </div>
              {interests.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block text-xs mb-1 font-medium">
                    {role === 'student' ? 'Student Interests' : 'Interests'} ({interests.length})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
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
