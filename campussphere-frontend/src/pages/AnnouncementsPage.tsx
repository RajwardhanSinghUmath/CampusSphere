import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Pin, Plus, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../lib/utils'
import { Announcement } from '../types'

export function AnnouncementsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/api/announcements?pinned_first=true')
        setAnnouncements(res.data?.items ?? res.data ?? [])
      } catch {
        setAnnouncements([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  const pinned = announcements.filter((a) => a.is_pinned)
  const regular = announcements.filter((a) => !a.is_pinned)

  const AnnouncementCard = ({ a }: { a: Announcement }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/announcements/${a.id}`)}>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {a.is_pinned && (
              <div className="text-orange-500">
                <Pin size={14} />
              </div>
            )}
            <h3 className="font-semibold text-gray-900">{a.title}</h3>
            {a.is_pinned && <Badge variant="warning">Pinned</Badge>}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
          <p className="text-xs text-gray-400 mt-2">
            {a.author_name ?? 'Admin'} · {formatDate(a.created_at)}
          </p>
        </div>
        <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm mt-0.5">Stay updated with the latest campus news</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/announcements/create')} size="sm">
            <Plus size={16} /> Create
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 h-24" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No announcements yet"
          description="Announcements from admin will appear here."
          action={
            isAdmin ? (
              <Button onClick={() => navigate('/announcements/create')}>
                <Plus size={16} /> Create Announcement
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Pin size={12} /> Pinned
              </h2>
              {pinned.map((a) => <AnnouncementCard key={a.id} a={a} />)}
            </div>
          )}
          {regular.length > 0 && (
            <div className="space-y-3">
              {pinned.length > 0 && (
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Recent
                </h2>
              )}
              {regular.map((a) => <AnnouncementCard key={a.id} a={a} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
