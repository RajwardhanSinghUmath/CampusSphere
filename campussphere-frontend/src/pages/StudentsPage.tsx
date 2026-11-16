import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronDown,
  ArrowUpDown,
  Download,
  Eye,
  X,
  Mail,
  Award,
  Calendar,
  Layers,
  RefreshCw,
  UserCheck
} from 'lucide-react'
import api from '../lib/api'
import { StudentRecord } from '../types'
import { getAllStudents } from '../lib/mockData'

export function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [sortField, setSortField] = useState<keyof StudentRecord>('roll_number')
  const [sortAsc, setSortAsc] = useState(true)
  const [activeModalStudent, setActiveModalStudent] = useState<StudentRecord | null>(null)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/students')
      if (response.data && response.data.students && response.data.students.length > 0) {
        setStudents(response.data.students)
      } else {
        setStudents(getAllStudents())
      }
    } catch {
      // Local fallback
      setStudents(getAllStudents())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Derived filter lists
  const departments = useMemo(() => {
    const set = new Set<string>()
    students.forEach((s) => {
      if (s.department) set.add(s.department)
    })
    return Array.from(set).sort()
  }, [students])

  const batches = useMemo(() => {
    const set = new Set<string>()
    students.forEach((s) => {
      if (s.batch) set.add(s.batch)
    })
    return Array.from(set).sort()
  }, [students])

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const matchesSearch =
          !search ||
          student.full_name.toLowerCase().includes(search.toLowerCase()) ||
          student.roll_number.toLowerCase().includes(search.toLowerCase()) ||
          student.email.toLowerCase().includes(search.toLowerCase())

        const matchesDept = selectedDept === 'all' || student.department === selectedDept
        const matchesBatch = selectedBatch === 'all' || student.batch === selectedBatch
        const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus
        const matchesSemester =
          selectedSemester === 'all' || student.semester.toString() === selectedSemester

        return matchesSearch && matchesDept && matchesBatch && matchesStatus && matchesSemester
      })
      .sort((a, b) => {
        let valA: any = a[sortField]
        let valB: any = b[sortField]

        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1
      })
  }, [students, search, selectedDept, selectedBatch, selectedStatus, selectedSemester, sortField, sortAsc])

  const handleSort = (field: keyof StudentRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const exportCSV = () => {
    const headers = ['Roll Number', 'Full Name', 'Email', 'Department', 'Semester', 'Batch', 'CGPA', 'Status', 'Role']
    const rows = filteredStudents.map((s) => [
      s.roll_number,
      `"${s.full_name}"`,
      s.email,
      `"${s.department}"`,
      s.semester,
      s.batch,
      s.cgpa,
      s.status,
      s.role,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `nit_student_registry_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Summary Metrics
  const totalCount = students.length
  const activeCount = students.filter((s) => s.status === 'active').length
  const avgCgpa = (
    students.reduce((acc, curr) => acc + (curr.cgpa || 0), 0) / (students.length || 1)
  ).toFixed(2)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={28} />
            <span>Student Registration Registry</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Official collegiate registry of enrolled undergraduate and postgraduate students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enrolled</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalCount}</p>
          <span className="text-xs text-gray-400 mt-1 block">Registered in Registry</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Status</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{activeCount}</p>
          <span className="text-xs text-gray-400 mt-1 block">Cleared tuition & attendance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{departments.length}</p>
          <span className="text-xs text-gray-400 mt-1 block">Engineering & Sciences</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mean CGPA</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{avgCgpa}</p>
          <span className="text-xs text-gray-400 mt-1 block">Institute aggregate</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search by name, roll number, or institute email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div className="w-full md:w-36">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="w-full md:w-32">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s.toString()}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-32">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>
            Showing <strong className="text-gray-900 font-semibold">{filteredStudents.length}</strong> of{' '}
            {students.length} students
          </span>
          {(search || selectedDept !== 'all' || selectedBatch !== 'all' || selectedStatus !== 'all' || selectedSemester !== 'all') && (
            <button
              onClick={() => {
                setSearch('')
                setSelectedDept('all')
                setSelectedBatch('all')
                setSelectedStatus('all')
                setSelectedSemester('all')
              }}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading student registrations...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="mx-auto text-gray-300 mb-3" size={42} />
            <p className="text-gray-700 font-semibold">No students match your criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try relaxing your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('roll_number')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Roll Number</span>
                      <ArrowUpDown size={12} className="text-gray-400" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Student Name</span>
                      <ArrowUpDown size={12} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-3 py-3.5 text-center">Sem / Batch</th>
                  <th
                    className="px-3 py-3.5 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('cgpa')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>CGPA</span>
                      <ArrowUpDown size={12} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="px-3 py-3.5 text-center">Role</th>
                  <th className="px-3 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs text-blue-700">
                      {s.roll_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs flex-shrink-0">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[220px] truncate">
                      {s.department}
                    </td>
                    <td className="px-3 py-3 text-xs text-center text-gray-600">
                      <span className="font-semibold text-gray-800">Sem {s.semester}</span>
                      <span className="text-gray-400 block text-[11px]">{s.batch}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block font-bold text-xs px-2 py-0.5 rounded-md ${
                          s.cgpa >= 9.0
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.cgpa >= 8.0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.cgpa.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {s.role === 'club_leader' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                          <Users size={10} />
                          Club Leader
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          <UserCheck size={10} />
                          Student
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {s.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActiveModalStudent(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setActiveModalStudent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {activeModalStudent.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {activeModalStudent.full_name}
                </h3>
                <p className="text-xs font-mono text-blue-600 font-semibold mt-0.5">
                  {activeModalStudent.roll_number}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {activeModalStudent.batch}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      activeModalStudent.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeModalStudent.status === 'active' ? 'Active Enrollment' : 'Suspended / Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs mb-5">
              <div>
                <span className="text-gray-400 block font-medium">Department</span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {activeModalStudent.department}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Current Semester</span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  Semester {activeModalStudent.semester}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Cumulative GPA</span>
                <span className="font-bold text-emerald-600 block mt-0.5 text-sm">
                  {activeModalStudent.cgpa.toFixed(2)} / 10.0
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Campus Role</span>
                <span className="font-semibold text-gray-800 block mt-0.5 capitalize">
                  {activeModalStudent.role.replace('_', ' ')}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200">
                <span className="text-gray-400 block font-medium">Institute Email</span>
                <span className="font-mono text-blue-700 block mt-0.5">
                  {activeModalStudent.email}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModalStudent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${activeModalStudent.email}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                <Mail size={14} />
                <span>Contact Student</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
