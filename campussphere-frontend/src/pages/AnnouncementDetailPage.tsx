import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pin, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDate } from '../lib/utils'
import { Announcement } from '../types'

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await api.get(`/api/announcements/${id}`)
        setAnnouncement(res.data)
      } catch {
        setError('Announcement not found.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnnouncement()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this announcement?')) return
    try {
      await api.delete(`/api/announcements/${id}`)
      navigate('/announcements')
    } catch {
      setError('Failed to delete announcement.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Announcement not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/announcements')}>
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')}>
        <ArrowLeft size={16} /> Back to Announcements
      </Button>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {announcement.is_pinned && (
                  <>
                    <Pin size={16} className="text-orange-500" />
                    <Badge variant="warning">Pinned</Badge>
                  </>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
            </div>
            {isAdmin && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-500 pb-4 border-b border-gray-100">
            Posted by <span className="font-medium text-gray-700">{announcement.author_name ?? 'Admin'}</span>
            {' · '}
            {formatDate(announcement.created_at)}
          </div>

          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {announcement.content}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
