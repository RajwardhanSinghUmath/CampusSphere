import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, User, CheckCircle, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDate } from '../lib/utils'
import { LostFoundItem } from '../types'

export function LostFoundDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState<LostFoundItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/api/lost-found/${id}`)
        setItem(res.data)
      } catch {
        setError('Item not found.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchItem()
  }, [id])

  const handleResolve = async () => {
    if (!confirm('Mark this item as resolved?')) return
    setResolving(true)
    try {
      await api.patch(`/api/lost-found/${id}/resolve`)
      setItem((prev) => prev ? { ...prev, status: 'resolved' } : prev)
    } catch {
      setError('Failed to resolve item.')
    } finally {
      setResolving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/api/lost-found/${id}`)
      navigate('/lost-found')
    } catch {
      setError('Failed to delete item.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Item not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/lost-found')}>
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
    )
  }

  const isOwner = user?.id === item.user_id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/lost-found')}>
        <ArrowLeft size={16} /> Back to Lost &amp; Found
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        {item.image_url && (
          <div className="h-56 overflow-hidden bg-gray-100">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="space-y-5">
          {/* Title & Badges */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={item.type === 'lost' ? 'danger' : 'success'} className="capitalize">
                  {item.type}
                </Badge>
                {item.status === 'resolved' && <Badge variant="default">Resolved</Badge>}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            </div>
            {(isOwner || user?.role === 'admin') && (
              <div className="flex gap-2 flex-shrink-0">
                {isOwner && item.status === 'open' && (
                  <Button size="sm" variant="outline" isLoading={resolving} onClick={handleResolve}>
                    <CheckCircle size={14} /> Resolve
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <MapPin size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-900">{item.location}</p>
              </div>
            </div>
            {item.contact_info && (
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contact</p>
                  <p className="text-sm font-medium text-gray-900">{item.contact_info}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Posted by</p>
                <p className="text-sm font-medium text-gray-900">{item.poster_name ?? 'Anonymous'}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">Posted on {formatDate(item.created_at)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
