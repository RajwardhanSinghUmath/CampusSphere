import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, Trash2, Edit } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDateTime } from '../lib/utils'
import { Club, Event } from '../types'

interface Member {
  id: string
  full_name: string
  email: string
  role: string
}

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const fetchClub = async () => {
    try {
      const [clubRes, membersRes, eventsRes] = await Promise.allSettled([
        api.get(`/api/clubs/${id}`),
        api.get(`/api/clubs/${id}/members`),
        api.get(`/api/events?club_id=${id}`),
      ])
      if (clubRes.status === 'fulfilled') setClub(clubRes.value.data)
      if (membersRes.status === 'fulfilled') setMembers(membersRes.value.data?.items ?? membersRes.value.data ?? [])
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.items ?? eventsRes.value.data ?? [])
    } catch {
      setError('Failed to load club.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchClub() }, [id])

  const handleJoinLeave = async () => {
    if (!club) return
    setJoining(true)
    try {
      if (club.is_member) {
        await api.delete(`/api/clubs/${id}/join`)
      } else {
        await api.post(`/api/clubs/${id}/join`)
      }
      await fetchClub()
    } catch {
      setError('Failed to update membership.')
    } finally {
      setJoining(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this club?')) return
    try {
      await api.delete(`/api/clubs/${id}`)
      navigate('/clubs')
    } catch {
      setError('Failed to delete club.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Club not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/clubs')}>
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/clubs')}>
        <ArrowLeft size={16} /> Back to Clubs
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Club Header */}
      <Card>
        <CardContent className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {club.logo_url ? (
              <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <Users size={36} className="text-blue-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users size={14} />
                    <span>{club.member_count} members</span>
                  </div>
                  {club.is_member && <Badge variant="success">Member</Badge>}
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/clubs/${id}/edit`)}>
                    <Edit size={14} /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleDelete}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              )}
            </div>
            <p className="text-gray-600 mt-3 leading-relaxed">{club.description}</p>
            <div className="mt-4">
              <Button
                variant={club.is_member ? 'outline' : 'primary'}
                size="sm"
                isLoading={joining}
                onClick={handleJoinLeave}
              >
                {club.is_member ? 'Leave Club' : 'Join Club'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} className="text-blue-600" /> Members ({members.length})
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No members yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                    {m.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.full_name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Club Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" /> Club Events
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  <div className="bg-blue-50 text-blue-600 rounded-lg p-2 text-center w-12 flex-shrink-0">
                    <p className="text-xs font-semibold leading-tight">
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-lg font-bold leading-tight">{new Date(ev.date).getDate()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(ev.date)} · {ev.location}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
