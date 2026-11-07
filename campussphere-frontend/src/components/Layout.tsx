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
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/clubs', icon: Users, label: 'Clubs' },
  { path: '/announcements', icon: Bell, label: 'Announcements' },
  { path: '/lost-found', icon: Search, label: 'Lost & Found' },
  { path: '/resources', icon: BookOpen, label: 'Resources' },
]

function SidebarContent({
  onNavigate,
  user,
  handleLogout,
  currentPath,
}: {
  onNavigate: () => void
  user: { full_name: string; role: string } | null
  handleLogout: () => void
  currentPath: string
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-white font-bold text-xl">CampusSphere</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = currentPath === path
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.full_name}</p>
            <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white w-full px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
}

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-900 flex-col flex-shrink-0">
        <SidebarContent
          onNavigate={() => {}}
          user={user}
          handleLogout={handleLogout}
          currentPath={location.pathname}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-gray-900 h-full">
            <SidebarContent
              onNavigate={() => setSidebarOpen(false)}
              user={user}
              handleLogout={handleLogout}
              currentPath={location.pathname}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <GraduationCap className="text-white" size={18} />
            </div>
            <span className="font-bold text-gray-900">CampusSphere</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
