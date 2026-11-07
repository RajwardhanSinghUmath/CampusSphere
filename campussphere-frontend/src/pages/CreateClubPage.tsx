import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function CreateClubPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', logo_url: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required.')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/api/clubs', {
        ...form,
        logo_url: form.logo_url || undefined,
      })
      navigate('/clubs')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create club.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/clubs')}>
        <ArrowLeft size={16} /> Back to Clubs
      </Button>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">Create New Club</h1>
          <p className="text-sm text-gray-500 mt-1">Set up a new campus club for students to join.</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="name"
              name="name"
              label="Club Name *"
              placeholder="e.g. Robotics Club"
              value={form.name}
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
                placeholder="Describe what this club is about…"
                value={form.description}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <Input
              id="logo_url"
              name="logo_url"
              label="Logo URL (optional)"
              type="url"
              placeholder="https://…"
              value={form.logo_url}
              onChange={handleChange}
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isLoading}>
                Create Club
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/clubs')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
