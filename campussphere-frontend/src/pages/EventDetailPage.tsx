import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, Image, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDateTime } from '../lib/utils'
import { Event } from '../types'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchEvent = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/api/events/${id}`)
      setEvent(res.data)
    } catch {
      setError('Event not found.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchEvent() }, [id])

  const handleRsvp = async () => {
    if (!event) return
    setRsvpLoading(true)
    try {
      if (event.is_rsvped) {
        await api.delete(`/api/events/${id}/rsvp`)
      } else {
        await api.post(`/api/events/${id}/rsvp`)
      }
      await fetchEvent()
    } catch {
      setError('Failed to update RSVP.')
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    try {
      await api.delete(`/api/events/${id}`)
      navigate('/events')
    } catch {
      setError('Failed to delete event.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Event not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/events')}>
          <ArrowLeft size={16} /> Back to Events
        </Button>
      </div>
    )
  }

  const spotsLeft = event.max_attendees
    ? event.max_attendees - event.attendee_count
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
        <ArrowLeft size={16} /> Back to Events
      </Button>

      <Card className="overflow-hidden">
        {/* Event Image */}
        <div className="h-56 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center overflow-hidden">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <Image size={56} className="text-blue-300" />
          )}
        </div>

        <CardContent className="space-y-6">
          {/* Title & Admin Actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              {event.is_rsvped && <Badge variant="success" className="mt-2">You're attending!</Badge>}
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}/edit`)}>
                  <Edit size={14} /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Date & Time</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <MapPin size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-900">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Attendees</p>
                <p className="text-sm font-medium text-gray-900">
                  {event.attendee_count}
                  {event.max_attendees ? ` / ${event.max_attendees}` : ' registered'}
                  {spotsLeft !== null && spotsLeft > 0 && (
                    <span className="text-green-600 ml-1">({spotsLeft} spots left)</span>
                  )}
                  {spotsLeft !== null && spotsLeft <= 0 && (
                    <span className="text-red-600 ml-1">(Full)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">About this Event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* RSVP Button */}
          {!isAdmin && (
            <div className="pt-2">
              {error && (
                <p className="text-sm text-red-600 mb-3">{error}</p>
              )}
              <Button
                onClick={handleRsvp}
                isLoading={rsvpLoading}
                variant={event.is_rsvped ? 'outline' : 'primary'}
                size="lg"
                disabled={!event.is_rsvped && spotsLeft !== null && spotsLeft <= 0}
              >
                {event.is_rsvped ? (
                  <><XCircle size={18} /> Cancel RSVP</>
                ) : (
                  <><CheckCircle size={18} /> Join Event</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
