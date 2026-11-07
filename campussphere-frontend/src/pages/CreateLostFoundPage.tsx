import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function CreateLostFoundPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'lost',
    location: '',
    contact_info: '',
    image_url: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Title, description and location are required.')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/api/lost-found', {
        ...form,
        contact_info: form.contact_info || undefined,
        image_url: form.image_url || undefined,
      })
      navigate('/lost-found')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to post item.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/lost-found')}>
        <ArrowLeft size={16} /> Back to Lost &amp; Found
      </Button>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">Post Lost &amp; Found Item</h1>
          <p className="text-sm text-gray-500 mt-1">Report something you lost or found on campus.</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="title"
                name="title"
                label="Item Name *"
                placeholder="e.g. Blue Water Bottle"
                value={form.title}
                onChange={handleChange}
                required
              />
              <div className="space-y-1">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the item in detail…"
                value={form.description}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <Input
              id="location"
              name="location"
              label="Location *"
              placeholder="e.g. Library, 2nd floor"
              value={form.location}
              onChange={handleChange}
              required
            />
            <Input
              id="contact_info"
              name="contact_info"
              label="Contact Info (optional)"
              placeholder="Phone number or email"
              value={form.contact_info}
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
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isLoading}>
                Post Item
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/lost-found')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
