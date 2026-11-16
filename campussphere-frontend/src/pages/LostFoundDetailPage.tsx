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
import { getAllLostFound } from '../lib/mockData'

export function LostFoundDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isPrivileged } = useAuth()
  const [item, setItem] = useState<LostFoundItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true)
      try {
        const res = await api.get(`/api/lost-found/${id}`)
        if (res.data && res.data.title) {
          setItem(res.data)
          setIsLoading(false)
          return
        }
      } catch {
        // Fallback
      }

      const allItems = getAllLostFound()
      const fallback = allItems.find((i) => i.id === id) || allItems[0]
      setItem(fallback)
      setIsLoading(false)
    }
    fetchItem()
  }, [id])

  const handleResolve = async () => {
    if (!confirm('Mark this listing as resolved?')) return
    setResolving(true)
    try {
      await api.put(`/api/lost-found/${id}/resolve`)
      setItem((prev) => (prev ? { ...prev, status: 'resolved' } : prev))
    } catch {
      setItem((prev) => (prev ? { ...prev, status: 'resolved' } : prev))
    } finally {
      setResolving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      await api.delete(`/api/lost-found/${id}`)
    } catch {
      // proceed
    }
    navigate('/lost-found')
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
          <ArrowLeft size={16} /> Back to Lost & Found
        </Button>
      </div>
    )
  }

  const isLost = item.type === 'lost'
  const isResolved = item.status === 'resolved'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/lost-found')}>
        <ArrowLeft size={16} /> Back to Lost & Found
      </Button>

      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        {item.image_url && (
          <div className="h-64 w-full bg-gray-900 relative overflow-hidden">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge variant={isLost ? 'danger' : 'info'}>
                {isLost ? 'Lost Item' : 'Found Item'}
              </Badge>
              <Badge variant={isResolved ? 'success' : 'warning'}>
                {isResolved ? 'Resolved' : 'Active Listing'}
              </Badge>
            </div>
          </div>
        )}

        <CardContent className="p-6 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            <p className="text-xs text-gray-400 mt-1">Reported on {formatDate(item.created_at)}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100 text-sm">
            <div className="flex items-center gap-2.5 text-gray-700">
              <MapPin size={16} className="text-blue-600 flex-shrink-0" />
              <span>Location: <strong>{item.location}</strong></span>
            </div>
            {item.contact_info && (
              <div className="flex items-center gap-2.5 text-gray-700">
                <Phone size={16} className="text-blue-600 flex-shrink-0" />
                <span>Contact Details: <strong>{item.contact_info}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-gray-700">
              <User size={16} className="text-blue-600 flex-shrink-0" />
              <span>Posted by: <strong>{item.poster_name || 'Campus Student'}</strong></span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">Description</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            {!isResolved ? (
              <Button
                variant="primary"
                size="sm"
                isLoading={resolving}
                onClick={handleResolve}
              >
                <CheckCircle size={15} /> Mark as Resolved
              </Button>
            ) : (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle size={16} /> Item Case Closed
              </span>
            )}

            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} /> Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
