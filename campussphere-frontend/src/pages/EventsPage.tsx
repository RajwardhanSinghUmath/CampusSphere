import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Plus, Image } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDateTime } from '../lib/utils'
import { Event } from '../types'

export function EventsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming')

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const params = filter === 'upcoming' ? '?upcoming=true' : ''
        const res = await api.get(`/api/events${params}`)
        setEvents(res.data?.items ?? res.data ?? [])
      } catch {
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [filter])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 text-sm mt-0.5">Discover and join campus events</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/events/create')} size="sm">
            <Plus size={16} /> Create Event
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['upcoming', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'upcoming' ? 'Upcoming' : 'All Events'}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 h-72" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description={filter === 'upcoming' ? 'No upcoming events scheduled.' : 'No events have been created yet.'}
          action={
            isAdmin ? (
              <Button onClick={() => navigate('/events/create')}>
                <Plus size={16} /> Create First Event
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center overflow-hidden">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <Image size={40} className="text-blue-300" />
                )}
              </div>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                  {event.is_rsvped && (
                    <Badge variant="success" className="mt-1">RSVP'd</Badge>
                  )}
                </div>
                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{formatDateTime(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>
                      {event.attendee_count} attendee{event.attendee_count !== 1 ? 's' : ''}
                      {event.max_attendees ? ` / ${event.max_attendees}` : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
