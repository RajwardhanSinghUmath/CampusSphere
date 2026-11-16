import React, { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bell,
  Search,
  BookOpen,
  LogOut,
  Menu,
  GraduationCap,
  Sparkles,
  Shield,
  Briefcase,
  UserCheck,
  ChevronDown
} from 'lucide-react'
import { useAuth, CAMPUS_PROFILES } from '../contexts/AuthContext'
import { UserRole } from '../types'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant', highlight: true },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/clubs', icon: Users, label: 'Clubs' },
  { path: '/announcements', icon: Bell, label: 'Announcements' },
  { path: '/students', icon: GraduationCap, label: 'Student Registry', roles: ['admin', 'faculty', 'staff'] },
  { path: '/lost-found', icon: Search, label: 'Lost & Found' },
  { path: '/resources', icon: BookOpen, label: 'Resources' },
]

const roleBadgeInfo: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  admin: { label: 'Administrator', bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-300', icon: Shield },
  club_leader: { label: 'Club Leader', bg: 'bg-purple-500/20 border-purple-500/30', text: 'text-purple-300', icon: Users },
  faculty: { label: 'Faculty / Prof', bg: 'bg-green-500/20 border-green-500/30', text: 'text-green-300', icon: BookOpen },
  staff: { label: 'Campus Staff', bg: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-300', icon: Briefcase },
  student: { label: 'Student', bg: 'bg-blue-500/20 border-blue-500/30', text: 'text-blue-300', icon: UserCheck },
}

function SidebarContent({
  onNavigate,
  user,
  handleLogout,
  onSwitchRole,
  currentPath,
}: {
  onNavigate: () => void
  user: { full_name: string; role: string; email: string } | null
  handleLogout: () => void
  onSwitchRole: (role: UserRole) => void
  currentPath: string
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const currentRole = user?.role || 'student'
  const roleMeta = roleBadgeInfo[currentRole] || roleBadgeInfo.student
  const RoleIcon = roleMeta.icon

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight block">CampusSphere</span>
            <span className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">NIT Campus Hub</span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems
          .filter(item => !item.roles || item.roles.includes(currentRole))
          .map(({ path, icon: Icon, label, highlight }) => {
          const isActive = currentPath === path
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavigate}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : highlight
                  ? 'text-purple-300 hover:bg-purple-950/40 hover:text-white border border-purple-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={highlight && !isActive ? 'text-purple-400' : ''} />
                <span>{label}</span>
              </div>
              {highlight && (
                <span className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                  Groq AI
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Role Switcher */}
      <div className="p-3 border-t border-gray-800/80 bg-gray-950/40">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-full text-left p-2.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-700/60 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Active Role</div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <RoleIcon size={12} className={roleMeta.text} />
                  <span>{roleMeta.label}</span>
                </div>
              </div>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-gray-900 rounded-xl border border-gray-700 shadow-2xl space-y-1 z-50">
              <div className="text-[10px] text-gray-400 font-semibold uppercase px-2 py-1">
                Switch Active Role
              </div>
              {CAMPUS_PROFILES.map((acc) => {
                const Icon = roleBadgeInfo[acc.role]?.icon || UserCheck
                const isSelected = currentRole === acc.role
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => {
                      onSwitchRole(acc.role)
                      setShowRoleMenu(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={13} />
                      {acc.roleTitle}
                    </span>
                    <span className="text-[10px] opacity-70 capitalize">{acc.role.replace('_', ' ')}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate leading-tight">{user?.full_name}</p>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium border ${roleMeta.bg} ${roleMeta.text}`}>
                <RoleIcon size={10} />
                <span>{roleMeta.label}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white w-full px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export function Layout() {
  const { user, logout, loginAsDemo } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSwitchRole = async (role: UserRole) => {
    await loginAsDemo(role)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-900 flex-col flex-shrink-0 shadow-lg">
        <SidebarContent
          onNavigate={() => {}}
          user={user}
          handleLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          currentPath={location.pathname}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-gray-900 h-full shadow-2xl">
            <SidebarContent
              onNavigate={() => setSidebarOpen(false)}
              user={user}
              handleLogout={handleLogout}
              onSwitchRole={handleSwitchRole}
              currentPath={location.pathname}
            />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900 p-1"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <GraduationCap size={16} />
              </div>
              <span className="font-bold text-gray-900 text-sm">CampusSphere</span>
            </div>
          </div>

          {/* Institutional Badge */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              NIT Campus Hub • Production System
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
