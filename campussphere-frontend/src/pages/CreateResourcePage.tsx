import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const COMMON_SUBJECTS = [
  'Computer Science',
  'Software Engineering',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management',
  'Computer Networks',
  'Mathematics',
  'Physics',
  'Electronics',
  'General / Other'
]

export function CreateResourcePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    file_type: 'pdf',
    subject: 'Computer Science',
    custom_subject: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.url.trim()) {
      setError('Title and Resource URL are required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const finalSubject = formData.subject === 'Custom' 
        ? formData.custom_subject.trim() 
        : formData.subject

      await api.post('/api/resources', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        file_type: formData.file_type,
        subject: finalSubject || 'General'
      })

      navigate('/resources')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload resource. Please check the inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/resources')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Resources
      </button>

      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Share a Study Resource</h1>
              <p className="text-sm text-gray-500">Provide materials, documentation, or links for students.</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="title"
              label="Resource Title *"
              placeholder="e.g. Software Engineering Complete Notes - Unit 1 to 5"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Briefly describe what this resource covers..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Input
              id="url"
              label="Resource URL (Google Drive, GitHub, PDF Link, YouTube, etc.) *"
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="file_type" className="block text-sm font-medium text-gray-700">
                  Resource Type
                </label>
                <select
                  id="file_type"
                  value={formData.file_type}
                  onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="document">Doc / Presentation</option>
                  <option value="link">Web Link / Article</option>
                  <option value="video">Video Lecture</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject / Category
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {COMMON_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                  <option value="Custom">Custom Subject...</option>
                </select>
              </div>
            </div>

            {formData.subject === 'Custom' && (
              <Input
                id="custom_subject"
                label="Custom Subject Name"
                placeholder="Enter subject name"
                value={formData.custom_subject}
                onChange={(e) => setFormData({ ...formData, custom_subject: e.target.value })}
                required
              />
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/resources')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Share Resource
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
