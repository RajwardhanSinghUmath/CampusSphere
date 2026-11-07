import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function CreateEventPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    max_attendees: '',
    image_url: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      setError('Title, date and location are required.')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/api/events', {
        ...form,
        max_attendees: form.max_attendees ? Number(form.max_attendees) : undefined,
        image_url: form.image_url || undefined,
      })
      navigate('/events')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create event.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
        <ArrowLeft size={16} /> Back to Events
      </Button>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to schedule a new campus event.</p>
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
              label="Event Title *"
              placeholder="e.g. Annual Tech Fest"
              value={form.title}
              onChange={handleChange}
              required
            />
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the event…"
                value={form.description}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="date"
                name="date"
                label="Date & Time *"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
                required
              />
              <Input
                id="location"
                name="location"
                label="Location *"
                placeholder="e.g. Main Auditorium"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="max_attendees"
                name="max_attendees"
                label="Max Attendees (optional)"
                type="number"
                min="1"
                placeholder="Leave blank for unlimited"
                value={form.max_attendees}
                onChange={handleChange}
              />
              <Input
                id="image_url"
                name="image_url"
                label="Image URL (optional)"
                type="url"
                placeholder="https://…"
                value={form.image_url}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isLoading}>
                Create Event
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
