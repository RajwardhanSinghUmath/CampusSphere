import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pin, Trash2, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDate } from '../lib/utils'
import { Announcement } from '../types'
import { mockAnnouncements } from '../lib/mockData'

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, canCreateAnnouncements } = useAuth()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setIsLoading(true)
      try {
        const res = await api.get(`/api/announcements/${id}`)
        if (res.data && res.data.title) {
          setAnnouncement(res.data)
          setIsLoading(false)
          return
        }
      } catch {
        // Fallback
      }

      const fallback = mockAnnouncements.find((a) => a.id === id) || mockAnnouncements[0]
      setAnnouncement(fallback)
      setIsLoading(false)
    }
    fetchAnnouncement()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this announcement?')) return
    try {
      await api.delete(`/api/announcements/${id}`)
    } catch {
      // proceed
    }
    navigate('/announcements')
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
          <ArrowLeft size={16} /> Back to Announcements
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')}>
        <ArrowLeft size={16} /> Back to Announcements
      </Button>

      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-semibold">
              Official Notice
            </span>
            {announcement.is_pinned && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                <Pin size={12} /> Pinned Alert
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">{announcement.title}</h1>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 text-xs text-gray-500">
            <div>
              Published by <span className="font-semibold text-gray-800">{announcement.author_name || 'Academic Section'}</span>
            </div>
            <div>{formatDate(announcement.created_at)}</div>
          </div>

          <div className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-line text-sm">
            {announcement.content}
          </div>

          {(isAdmin || canCreateAnnouncements) && (
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 size={14} /> Remove Notice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
