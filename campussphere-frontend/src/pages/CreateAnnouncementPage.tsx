import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function CreateAnnouncementPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/api/announcements', form)
      navigate('/announcements')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create announcement.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')}>
        <ArrowLeft size={16} /> Back to Announcements
      </Button>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">Create Announcement</h1>
          <p className="text-sm text-gray-500 mt-1">Broadcast a message to all campus users.</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="title"
              name="title"
              label="Title *"
              placeholder="e.g. Campus Maintenance Notice"
              value={form.title}
              onChange={handleChange}
              required
            />
            <div className="space-y-1">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                placeholder="Write your announcement here…"
                value={form.content}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 font-medium">Pin this announcement</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isLoading}>
                Post Announcement
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/announcements')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
