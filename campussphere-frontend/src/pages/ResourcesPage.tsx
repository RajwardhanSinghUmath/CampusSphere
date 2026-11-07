import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, ExternalLink, Trash2, Filter } from 'lucide-react'
import api from '../lib/api'
import { Resource } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../lib/utils'

export function ResourcesPage() {
  const { user, isAdmin } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResources()
    fetchSubjects()
  }, [selectedSubject])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const url = selectedSubject && selectedSubject !== 'all' 
        ? `/api/resources?subject=${encodeURIComponent(selectedSubject)}` 
        : '/api/resources'
      const res = await api.get(url)
      setResources(res.data)
      setError(null)
    } catch (err: any) {
      setError('Failed to load study resources')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/api/resources/subjects')
      setSubjects(res.data)
    } catch (err) {
      console.error('Failed to load subjects', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return
    try {
      await api.delete(`/api/resources/${id}`)
      setResources((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete resource')
    }
  }

  const getFileTypeBadge = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <Badge variant="danger">PDF</Badge>
      case 'video':
        return <Badge variant="warning">Video</Badge>
      case 'link':
        return <Badge variant="info">Link</Badge>
      case 'document':
        return <Badge variant="success">Doc</Badge>
      default:
        return <Badge variant="default">{type || 'Resource'}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic & Campus Resources</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access study guides, notes, reference links, and academic resources shared by the campus community.
          </p>
        </div>
        <Link to="/resources/create">
          <Button className="w-full sm:w-auto">
            <Plus size={18} />
            Share Resource
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <Filter size={18} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Subject:</span>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resources found"
          description={
            selectedSubject !== 'all'
              ? `No resources uploaded under "${selectedSubject}" yet.`
              : 'Be the first to share helpful study materials and links with fellow students.'
          }
          action={
            <Link to="/resources/create">
              <Button>
                <Plus size={16} /> Share Resource
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const canManage = isAdmin || user?.id === res.uploaded_by
            return (
              <Card key={res.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getFileTypeBadge(res.file_type)}
                      {res.subject && (
                        <Badge variant="default">{res.subject}</Badge>
                      )}
                    </div>
                    {canManage && (
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete resource"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{res.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{res.description}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Uploaded {formatDate(res.created_at)}</span>
                    {res.uploader_name && <span>by {res.uploader_name}</span>}
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full mt-2 py-2 px-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <span>Open Resource</span>
                    <ExternalLink size={16} />
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
