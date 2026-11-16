export type UserRole = 'student' | 'admin' | 'club_leader' | 'faculty' | 'staff'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  department?: string
  interests?: string[]
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  club_id?: string
  created_by: string
  max_attendees?: number
  image_url?: string
  created_at: string
  attendee_count: number
  is_rsvped: boolean
}

export interface Club {
  id: string
  name: string
  description: string
  logo_url?: string
  created_by: string
  created_at: string
  member_count: number
  is_member: boolean
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
  is_pinned: boolean
  author_name?: string
}

export interface LostFoundItem {
  id: string
  title: string
  description: string
  type: 'lost' | 'found'
  location: string
  image_url?: string
  contact_info?: string
  user_id: string
  status: 'open' | 'resolved'
  created_at: string
  poster_name?: string
}

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  file_type?: string
  subject?: string
  uploaded_by: string
  created_at: string
  uploader_name?: string
}

export interface StudentRecord {
  id: string
  full_name: string
  email: string
  roll_number: string
  department: string
  semester: number
  batch: string
  role: string
  cgpa: number
  status: 'active' | 'inactive'
  interests?: string[]
  created_at: string
}
