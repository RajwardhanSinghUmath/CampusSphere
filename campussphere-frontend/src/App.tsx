import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { CreateEventPage } from './pages/CreateEventPage'
import { ClubsPage } from './pages/ClubsPage'
import { ClubDetailPage } from './pages/ClubDetailPage'
import { CreateClubPage } from './pages/CreateClubPage'
import { AnnouncementsPage } from './pages/AnnouncementsPage'
import { AnnouncementDetailPage } from './pages/AnnouncementDetailPage'
import { CreateAnnouncementPage } from './pages/CreateAnnouncementPage'
import { LostFoundPage } from './pages/LostFoundPage'
import { LostFoundDetailPage } from './pages/LostFoundDetailPage'
import { CreateLostFoundPage } from './pages/CreateLostFoundPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { CreateResourcePage } from './pages/CreateResourcePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">Loading CampusSphere...</span>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        
        {/* Events */}
        <Route path="events" element={<EventsPage />} />
        <Route
          path="events/create"
          element={
            <AdminRoute>
              <CreateEventPage />
            </AdminRoute>
          }
        />
        <Route path="events/:id" element={<EventDetailPage />} />

        {/* Clubs */}
        <Route path="clubs" element={<ClubsPage />} />
        <Route
          path="clubs/create"
          element={
            <AdminRoute>
              <CreateClubPage />
            </AdminRoute>
          }
        />
        <Route path="clubs/:id" element={<ClubDetailPage />} />

        {/* Announcements */}
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route
          path="announcements/create"
          element={
            <AdminRoute>
              <CreateAnnouncementPage />
            </AdminRoute>
          }
        />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />

        {/* Lost & Found */}
        <Route path="lost-found" element={<LostFoundPage />} />
        <Route path="lost-found/create" element={<CreateLostFoundPage />} />
        <Route path="lost-found/:id" element={<LostFoundDetailPage />} />

        {/* Resources */}
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/create" element={<CreateResourcePage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
