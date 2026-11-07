import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, AlertTriangle, Bell, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { formatDate, formatDateTime } from '../lib/utils'
import { Announcement, Event } from '../types'

interface Stats {
  total_events: number
  total_clubs: number
  open_lost_items: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, annRes, eventsRes] = await Promise.allSettled([
          api.get('/api/stats'),
          api.get('/api/announcements?limit=3&pinned_first=true'),
          api.get('/api/events?limit=3&upcoming=true'),
        ])
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
        if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data?.items ?? annRes.value.data ?? [])
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.items ?? eventsRes.value.data ?? [])
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Events', value: stats?.total_events ?? '—', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Clubs', value: stats?.total_clubs ?? '—', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Open Lost Items', value: stats?.open_lost_items ?? '—', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening on campus today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4">
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon className={color} size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '…' : value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Recent Announcements</h2>
              </div>
              <Link
                to="/announcements"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">No announcements yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <Link
                      to={`/announcements/${a.id}`}
                      className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                          {a.is_pinned && <Badge variant="info">Pinned</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">
                          {a.author_name ?? 'Admin'} · {formatDate(a.created_at)}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
              </div>
              <Link
                to="/events"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">No upcoming events.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {events.map((ev) => (
                  <li key={ev.id}>
                    <Link
                      to={`/events/${ev.id}`}
                      className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="bg-blue-100 text-blue-600 rounded-lg p-2 text-center w-12 flex-shrink-0">
                        <p className="text-xs font-semibold leading-tight">
                          {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-lg font-bold leading-tight">
                          {new Date(ev.date).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-500 truncate">{ev.location}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(ev.date)}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
