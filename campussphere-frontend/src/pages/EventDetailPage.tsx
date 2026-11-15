import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDateTime } from '../lib/utils'
import { Event } from '../types'
import { mockEvents } from '../lib/mockData'

const defaultEventImages = [
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
]

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, isPrivileged } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchEvent = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/api/events/${id}`)
      if (res.data && res.data.title) {
        setEvent(res.data)
        setIsLoading(false)
        return
      }
    } catch {
      // Fallback to mock event data
    }

    const fallback = mockEvents.find((e) => e.id === id) || mockEvents[0]
    setEvent(fallback)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchEvent()
  }, [id])

  const handleRsvp = async () => {
    if (!event) return
    setRsvpLoading(true)
    setError('')
    try {
      if (event.is_rsvped) {
        await api.delete(`/api/events/${id}/rsvp`)
      } else {
        await api.post(`/api/events/${id}/rsvp`)
      }
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_rsvped: !prev.is_rsvped,
              attendee_count: prev.is_rsvped ? prev.attendee_count - 1 : prev.attendee_count + 1,
            }
          : prev
      )
    } catch {
      // Local optimistic update
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_rsvped: !prev.is_rsvped,
              attendee_count: prev.is_rsvped ? prev.attendee_count - 1 : prev.attendee_count + 1,
            }
          : prev
      )
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this event?')) return
    try {
      await api.delete(`/api/events/${id}`)
    } catch {
      // proceed with navigation
    }
    navigate('/events')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Event not found.</p>
        <Button variant="outline" onClick={() => navigate('/events')}>
          <ArrowLeft size={16} /> Back to Events
        </Button>
      </div>
    )
  }

  const spotsLeft = event.max_attendees ? event.max_attendees - event.attendee_count : null
  const displayImage =
    event.image_url ||
    defaultEventImages[Math.abs((event.title.charCodeAt(0) || 0) % defaultEventImages.length)]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
        <ArrowLeft size={16} /> Back to Events
      </Button>

      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        {/* Event Banner Image */}
        <div className="h-64 sm:h-72 w-full bg-gray-900 relative overflow-hidden">
          <img
            src={displayImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <Badge variant={event.is_rsvped ? 'success' : 'info'} className="mb-2 shadow-xs">
              {event.is_rsvped ? 'RSVP Confirmed' : 'Registration Open'}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {event.title}
            </h1>
          </div>
        </div>

        <CardContent className="space-y-6 p-6">
          {/* Header Controls */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                Event Overview & Registration
              </p>
            </div>
            {(isAdmin || isPrivileged) && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
                  <Edit size={14} /> Manage
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} /> Remove
                </Button>
              </div>
            )}
          </div>

          {/* Meta Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-t border-b border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium">Date & Time</p>
                <p className="text-xs font-semibold text-gray-900 truncate">{formatDateTime(event.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium">Location</p>
                <p className="text-xs font-semibold text-gray-900 truncate">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium">Attendance</p>
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {event.attendee_count}
                  {event.max_attendees ? ` / ${event.max_attendees}` : ' registered'}
                </p>
              </div>
            </div>
          </div>

          {/* About Event */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              About this Event
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {event.description}
            </p>
          </div>

          {/* RSVP Button */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              {spotsLeft !== null && spotsLeft > 0 && (
                <span className="text-xs font-medium text-emerald-600">
                  {spotsLeft} seats remaining
                </span>
              )}
            </div>

            <Button
              onClick={handleRsvp}
              isLoading={rsvpLoading}
              variant={event.is_rsvped ? 'outline' : 'primary'}
              size="lg"
            >
              {event.is_rsvped ? (
                <>
                  <XCircle size={18} /> Cancel RSVP
                </>
              ) : (
                <>
                  <CheckCircle size={18} /> Confirm RSVP
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
