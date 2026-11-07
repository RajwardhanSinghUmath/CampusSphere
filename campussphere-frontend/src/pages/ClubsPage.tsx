import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Image } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Club } from '../types'

export function ClubsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  const fetchClubs = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/api/clubs')
      setClubs(res.data?.items ?? res.data ?? [])
    } catch {
      setClubs([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchClubs() }, [])

  const handleJoinLeave = async (club: Club) => {
    setJoiningId(club.id)
    try {
      if (club.is_member) {
        await api.delete(`/api/clubs/${club.id}/join`)
      } else {
        await api.post(`/api/clubs/${club.id}/join`)
      }
      await fetchClubs()
    } catch {
      // silent
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Join clubs and connect with peers</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/clubs/create')} size="sm">
            <Plus size={16} /> Create Club
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 h-56" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clubs yet"
          description="No clubs have been created. Check back later!"
          action={
            isAdmin ? (
              <Button onClick={() => navigate('/clubs/create')}>
                <Plus size={16} /> Create First Club
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/clubs/${club.id}`)}
                  >
                    {club.logo_url ? (
                      <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={28} className="text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/clubs/${club.id}`)}
                    >
                      {club.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <Users size={13} />
                      <span>{club.member_count} members</span>
                    </div>
                    {club.is_member && <Badge variant="success" className="mt-1">Member</Badge>}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{club.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/clubs/${club.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant={club.is_member ? 'secondary' : 'primary'}
                    size="sm"
                    className="flex-1"
                    isLoading={joiningId === club.id}
                    onClick={() => handleJoinLeave(club)}
                  >
                    {club.is_member ? 'Leave' : 'Join'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
