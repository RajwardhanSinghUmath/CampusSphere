import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../lib/utils'
import { LostFoundItem } from '../types'

type FilterType = 'all' | 'lost' | 'found' | 'resolved'

export function LostFoundPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter === 'lost') params.set('type', 'lost')
        else if (filter === 'found') params.set('type', 'found')
        else if (filter === 'resolved') params.set('status', 'resolved')
        else params.set('status', 'open')
        const res = await api.get(`/api/lost-found?${params.toString()}`)
        setItems(res.data?.items ?? res.data ?? [])
      } catch {
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchItems()
  }, [filter])

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Open' },
    { key: 'lost', label: 'Lost' },
    { key: 'found', label: 'Found' },
    { key: 'resolved', label: 'Resolved' },
  ]

  const typeBadge = (type: 'lost' | 'found') =>
    type === 'lost' ? (
      <Badge variant="danger">Lost</Badge>
    ) : (
      <Badge variant="success">Found</Badge>
    )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost &amp; Found</h1>
          <p className="text-gray-500 text-sm mt-0.5">Report or find lost items on campus</p>
        </div>
        {user && (
          <Button onClick={() => navigate('/lost-found/create')} size="sm">
            <Plus size={16} /> Post Item
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No items found"
          description="No lost or found items match your filter."
          action={
            user ? (
              <Button onClick={() => navigate('/lost-found/create')}>
                <Plus size={16} /> Post an Item
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/lost-found/${item.id}`)}
            >
              {item.image_url && (
                <div className="h-36 overflow-hidden bg-gray-100">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                  {typeBadge(item.type)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={13} />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                  {item.status === 'resolved' ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle size={12} /> Resolved
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <AlertTriangle size={12} /> Open
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
