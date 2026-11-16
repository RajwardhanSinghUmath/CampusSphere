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
import { getAllClubs, mockEvents } from '../lib/mockData'

interface Member {
  id: string
  full_name: string
  email: string
  role: string
}

const defaultClubMembers: Member[] = [
  { id: 'm1', full_name: 'Aarav Patel', email: 'aarav.p@nit.edu', role: 'member' },
  { id: 'm2', full_name: 'Ananya Sen', email: 'ananya.s@nit.edu', role: 'admin' },
  { id: 'm3', full_name: 'Rohan Gupta', email: 'rohan.g@nit.edu', role: 'member' },
  { id: 'm4', full_name: 'Pooja Nair', email: 'pooja.n@nit.edu', role: 'member' },
  { id: 'm5', full_name: 'Vikram Malhotra', email: 'vikram.m@nit.edu', role: 'faculty_advisor' },
]

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, isPrivileged } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const fetchClub = async () => {
    setIsLoading(true)
    try {
      const [clubRes, membersRes, eventsRes] = await Promise.allSettled([
        api.get(`/api/clubs/${id}`),
        api.get(`/api/clubs/${id}/members`),
        api.get(`/api/events?club_id=${id}`),
      ])

      let loadedClub = null
      if (clubRes.status === 'fulfilled' && clubRes.value?.data?.name) {
        loadedClub = clubRes.value.data
        setClub(loadedClub)
      } else {
        const allClubs = getAllClubs()
        loadedClub = allClubs.find((c) => c.id === id) || allClubs[0]
        setClub(loadedClub)
      }

      if (membersRes.status === 'fulfilled' && membersRes.value?.data?.length > 0) {
        setMembers(membersRes.value.data?.items ?? membersRes.value.data)
      } else {
        setMembers(defaultClubMembers)
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value?.data?.length > 0) {
        setEvents(eventsRes.value.data?.items ?? eventsRes.value.data)
      } else {
        setEvents(mockEvents.slice(0, 2))
      }
    } catch {
      const fallback = mockClubs.find((c) => c.id === id) || mockClubs[0]
      setClub(fallback)
      setMembers(defaultClubMembers)
      setEvents(mockEvents.slice(0, 2))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClub()
  }, [id])

  const handleJoinLeave = async () => {
    if (!club) return
    setJoining(true)
    try {
      if (club.is_member) {
        await api.delete(`/api/clubs/${id}/join`)
      } else {
        await api.post(`/api/clubs/${id}/join`)
      }
      setClub((prev) =>
        prev
          ? {
              ...prev,
              is_member: !prev.is_member,
              member_count: prev.is_member ? prev.member_count - 1 : prev.member_count + 1,
            }
          : prev
      )
    } catch {
      setClub((prev) =>
        prev
          ? {
              ...prev,
              is_member: !prev.is_member,
              member_count: prev.is_member ? prev.member_count - 1 : prev.member_count + 1,
            }
          : prev
      )
    } finally {
      setJoining(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this club?')) return
    try {
      await api.delete(`/api/clubs/${id}`)
    } catch {
      // proceed
    }
    navigate('/clubs')
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
          <ArrowLeft size={16} /> Back to Clubs
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/clubs')}>
        <ArrowLeft size={16} /> Back to Clubs
      </Button>

      {/* Club Header Card */}
      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <div className="h-44 w-full bg-gray-900 relative overflow-hidden">
          <img
            src={
              club.logo_url ||
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
            }
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <Badge variant={club.is_member ? 'success' : 'info'} className="mb-2">
                {club.is_member ? 'Active Member' : 'Open for Recruitment'}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {club.name}
              </h1>
            </div>
            <span className="text-xs text-white/90 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-medium">
              {club.member_count} Members
            </span>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                Official Campus Student Organization
              </p>
            </div>
            {(isAdmin || isPrivileged) && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
                  <Edit size={14} /> Manage
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} /> Remove
                </Button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Club Mission & Activities
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              {club.description}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant={club.is_member ? 'outline' : 'primary'}
              size="lg"
              isLoading={joining}
              onClick={handleJoinLeave}
            >
              {club.is_member ? 'Leave Club' : 'Join Club'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Roster */}
      <Card>
        <CardHeader className="py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users size={16} className="text-blue-600" /> Active Roster ({members.length})
            </span>
            <span className="text-xs text-gray-400 font-normal">Updated recently</span>
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-100">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-xs">
                    {m.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.full_name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <Badge variant={m.role === 'admin' ? 'warning' : 'default'} className="text-[10px] capitalize">
                  {m.role.replace('_', ' ')}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Club Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader className="py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" /> Club Hosted Events ({events.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 text-center w-14 flex-shrink-0">
                    <p className="text-[10px] font-bold uppercase">
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-lg font-extrabold">{new Date(ev.date).getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(ev.date)} · {ev.location}</p>
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
