import { Event, Club, Announcement, LostFoundItem, Resource, StudentRecord } from '../types'

const now = new Date()
const addDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString()

export const mockEvents: Event[] = [
  {
    id: 'ev-1',
    title: 'NIT National Hackathon 2026',
    description: '36-hour flagship hackathon. Over ₹1,50,000 in cash prizes, internships with top tech companies, and cloud sponsor credits. Food & swags provided!',
    date: addDays(5),
    location: 'Central Computing Center, Main Block',
    max_attendees: 150,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    created_by: 'user-admin',
    created_at: addDays(-3),
    attendee_count: 124,
    is_rsvped: true,
  },
  {
    id: 'ev-2',
    title: "Freshers' Orientation & Cultural Night",
    description: 'Grand welcome gala for Semester 1 students! Club showcase, musical performances by campus bands, games, and complimentary dinner buffet.',
    date: addDays(2),
    location: 'Open Air Amphitheatre',
    max_attendees: 350,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    created_by: 'user-admin',
    created_at: addDays(-4),
    attendee_count: 289,
    is_rsvped: true,
  },
  {
    id: 'ev-3',
    title: 'Industry Workshop: Generative AI & LLM Systems',
    description: 'Special hands-on workshop by NIT Alumni working at Google DeepMind and Groq. Learn fine-tuning, RAG architecture, and API deployment.',
    date: addDays(8),
    location: 'Seminar Hall 1, CSE Dept',
    max_attendees: 100,
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    created_by: 'user-faculty',
    created_at: addDays(-2),
    attendee_count: 86,
    is_rsvped: false,
  },
  {
    id: 'ev-4',
    title: 'Campus Sunset Photo Walk & Drone Showcase',
    description: 'Bring your DSLR or smartphone! Guided session on golden-hour photography and live FPV drone videography demo.',
    date: addDays(4),
    location: 'Sports Complex Pavilion',
    max_attendees: 40,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    created_by: 'user-club',
    created_at: addDays(-1),
    attendee_count: 32,
    is_rsvped: false,
  },
  {
    id: 'ev-5',
    title: 'Startup Pitch Fest & Angel Investor Mixer',
    description: '10 student teams pitch their ventures to angel investors. Cash grants up to ₹5,00,000 for top three prototypes.',
    date: addDays(12),
    location: 'Incubation Center Boardroom',
    max_attendees: 80,
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    created_by: 'user-faculty',
    created_at: addDays(-5),
    attendee_count: 54,
    is_rsvped: false,
  },
  {
    id: 'ev-6',
    title: 'Annual Inter-Hostel Cricket Tournament',
    description: '12-over tennis ball cricket tournament between all 8 campus hostels. Trophies, medals, and refreshments sponsored by Gymkhana.',
    date: addDays(6),
    location: 'Main University Oval Ground',
    max_attendees: 200,
    image_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    created_by: 'user-staff',
    created_at: addDays(-2),
    attendee_count: 140,
    is_rsvped: true,
  },
]

export const mockClubs: Club[] = [
  {
    id: 'club-1',
    name: 'NIT Coding Club',
    description: 'Campus hub for competitive programming, Web3, full-stack development, and hackathons.',
    logo_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    created_by: 'user-club',
    created_at: addDays(-120),
    member_count: 168,
    is_member: true,
  },
  {
    id: 'club-2',
    name: 'Robotics & Automation Society',
    description: 'Hands-on robotics, drone design, autonomous rovers, and IoT competitions.',
    logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    created_by: 'user-club',
    created_at: addDays(-90),
    member_count: 115,
    is_member: false,
  },
  {
    id: 'club-3',
    name: 'E-Cell (Entrepreneurship Cell)',
    description: 'Incubating student startups, connecting with VCs, and hosting business plan competitions.',
    logo_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
    created_by: 'user-faculty',
    created_at: addDays(-100),
    member_count: 142,
    is_member: true,
  },
  {
    id: 'club-4',
    name: 'Photography & Film Club',
    description: 'Visual storytelling, photo walks across campus, and cinematic campus media production.',
    logo_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80',
    created_by: 'user-student',
    created_at: addDays(-60),
    member_count: 84,
    is_member: false,
  },
  {
    id: 'club-5',
    name: 'Literary & Debating Society',
    description: 'Parliamentary debates, MUN simulations, creative writing slams, and annual literary fest.',
    logo_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    created_by: 'user-student',
    created_at: addDays(-75),
    member_count: 67,
    is_member: false,
  },
  {
    id: 'club-6',
    name: 'Green Campus Initiative',
    description: 'Promoting zero-waste campus, tree plantation drives, and solar power awareness.',
    logo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    created_by: 'user-staff',
    created_at: addDays(-50),
    member_count: 98,
    is_member: true,
  },
]

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Mid-Semester Examination Schedule (Sem 5) Released',
    content: 'The official timetable for Mid-Semester Examinations has been published by the Academic Section. Exams will run from Dec 1 to Dec 9, 2026. Hall tickets are mandatory. Quiet study spaces in the library will operate 24/7.',
    is_pinned: true,
    created_by: 'user-admin',
    author_name: 'Dr. Rajesh Sharma (Dean)',
    created_at: addDays(-1),
  },
  {
    id: 'ann-2',
    title: 'Campus High-Speed Wi-Fi 6 Upgrade Notice',
    content: 'Network Services has upgraded all academic blocks and hostel corridors with Wi-Fi 6 access points. Login using your student LDAP credentials. Report any dead zones via the student portal.',
    is_pinned: true,
    created_by: 'user-staff',
    author_name: 'Sunita Verma (Student Affairs)',
    created_at: addDays(-2),
  },
  {
    id: 'ann-3',
    title: 'Call for Research Internships — AI & Robotics Lab',
    content: 'Prof. Vikram Malhotra is inviting applications from 3rd and 4th year students for funded winter research projects on Computer Vision and Edge Robotics. Submit your resume by Nov 25th.',
    is_pinned: false,
    created_by: 'user-faculty',
    author_name: 'Prof. Vikram Malhotra (CSE)',
    created_at: addDays(-3),
  },
  {
    id: 'ann-4',
    title: 'NIT Coding Club Wins 1st Prize at National Inter-NIT Hackathon',
    content: "Congratulations to Team 'CampusSphere' for securing the championship trophy and ₹1 Lakh prize at the All-India Inter-NIT Tech Meet! Proud moment for the entire campus.",
    is_pinned: false,
    created_by: 'user-club',
    author_name: 'Ananya Sen (Coding Club Lead)',
    created_at: addDays(-4),
  },
]

export const mockLostFound: LostFoundItem[] = [
  {
    id: 'lf-1',
    title: 'Lost: Casio FX-991CW Calculator with Black Cover',
    description: 'Left in Lecture Hall 3 after the Engineering Mathematics class. Has a blue sticker on the back with roll no 21CS042.',
    type: 'lost',
    location: 'Lecture Hall 3, Academic Block A',
    contact_info: 'aarav.p@nit.edu | +91 98765 43210',
    image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    user_id: 'user-student',
    poster_name: 'Aarav Patel (Student)',
    status: 'open',
    created_at: addDays(-2),
  },
  {
    id: 'lf-2',
    title: 'Found: Black Sony WH-1000XM4 Headphones',
    description: 'Found on the 2nd floor silent reading room table in the Central Library. Kept safe with the library reception desk.',
    type: 'found',
    location: 'Central Library 2nd Floor',
    contact_info: 'Library Desk: library@nit.edu',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    user_id: 'user-staff',
    poster_name: 'Sunita Verma (Staff)',
    status: 'open',
    created_at: addDays(-1),
  },
  {
    id: 'lf-3',
    title: 'Lost: Set of 3 Hostel Keys on a Red Carabiner',
    description: "Lost between Hostel 4 mess and the football ground. One key has a brass tag 'H4-208'.",
    type: 'lost',
    location: 'Hostel 4 pathway',
    contact_info: 'rohan.g@nit.edu',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    user_id: 'user-student2',
    poster_name: 'Rohan Gupta (Student)',
    status: 'open',
    created_at: addDays(-3),
  },
  {
    id: 'lf-4',
    title: 'Found: Fastrack Metal Watch near Basketball Court',
    description: 'Silver dial with dark leather strap. Handed over to the campus security office at Gate 2.',
    type: 'found',
    location: 'Basketball Court',
    contact_info: 'Security Guard Office Gate 2',
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    user_id: 'user-staff',
    poster_name: 'Sunita Verma (Staff)',
    status: 'resolved',
    created_at: addDays(-5),
  },
]

export const mockResources: Resource[] = [
  {
    id: 'res-1',
    title: 'Software Engineering Lab Complete Manual & UML Diagrams',
    description: 'Comprehensive lab manual with Class diagrams, Sequence diagrams, Use Case specifications, and Design Patterns.',
    url: 'https://campussphere.internal/docs/se-lab-manual.pdf',
    file_type: 'pdf',
    subject: 'Software Engineering',
    uploaded_by: 'user-faculty',
    uploader_name: 'Prof. Vikram Malhotra (CSE)',
    created_at: addDays(-10),
  },
  {
    id: 'res-2',
    title: 'Machine Learning & Neural Networks Mid-Sem Question Bank',
    description: 'Previous 5 years question papers with detailed step-by-step mathematical solutions and model architectures.',
    url: 'https://campussphere.internal/docs/ml-question-bank.pdf',
    file_type: 'pdf',
    subject: 'Machine Learning',
    uploaded_by: 'user-faculty',
    uploader_name: 'Prof. Vikram Malhotra (CSE)',
    created_at: addDays(-8),
  },
  {
    id: 'res-3',
    title: 'Data Structures & Algorithms Handwritten Cheat Sheets',
    description: 'Color-coded visual cheat sheets covering Trees, Graphs, Dynamic Programming, and Amortized Time Complexity.',
    url: 'https://campussphere.internal/docs/dsa-cheatsheet.pdf',
    file_type: 'pdf',
    subject: 'Computer Science',
    uploaded_by: 'user-club',
    uploader_name: 'Ananya Sen (Coding Club Lead)',
    created_at: addDays(-6),
  },
  {
    id: 'res-4',
    title: 'Database Management Systems (SQL & Normalization) Slides',
    description: 'Official lecture presentations covering BCNF, 3NF, Transactions, ACID properties, and PostgreSQL indexing.',
    url: 'https://campussphere.internal/docs/dbms-slides.pdf',
    file_type: 'pdf',
    subject: 'Database Systems',
    uploaded_by: 'user-student',
    uploader_name: 'Aarav Patel (Student)',
    created_at: addDays(-4),
  },
]

export const mockStats = {
  total_events: mockEvents.length,
  total_clubs: mockClubs.length,
  open_lost_items: mockLostFound.filter((i) => i.status === 'open').length,
}

export function getAllEvents(): Event[] {
  try {
    const custom = JSON.parse(localStorage.getItem('campussphere_custom_events') || '[]')
    return [...custom, ...mockEvents]
  } catch {
    return mockEvents
  }
}

export function saveCustomEvent(event: Event): Event[] {
  try {
    const existing = JSON.parse(localStorage.getItem('campussphere_custom_events') || '[]')
    const updated = [event, ...existing]
    localStorage.setItem('campussphere_custom_events', JSON.stringify(updated))
    return [...updated, ...mockEvents]
  } catch {
    return mockEvents
  }
}

export function getAllClubs(): Club[] {
  try {
    const custom = JSON.parse(localStorage.getItem('campussphere_custom_clubs') || '[]')
    return [...custom, ...mockClubs]
  } catch {
    return mockClubs
  }
}

export function saveCustomClub(club: Club): Club[] {
  try {
    const existing = JSON.parse(localStorage.getItem('campussphere_custom_clubs') || '[]')
    const updated = [club, ...existing]
    localStorage.setItem('campussphere_custom_clubs', JSON.stringify(updated))
    return [...updated, ...mockClubs]
  } catch {
    return mockClubs
  }
}

export function getAllAnnouncements(): Announcement[] {
  try {
    const custom = JSON.parse(localStorage.getItem('campussphere_custom_announcements') || '[]')
    return [...custom, ...mockAnnouncements]
  } catch {
    return mockAnnouncements
  }
}

export function saveCustomAnnouncement(announcement: Announcement): Announcement[] {
  try {
    const existing = JSON.parse(localStorage.getItem('campussphere_custom_announcements') || '[]')
    const updated = [announcement, ...existing]
    localStorage.setItem('campussphere_custom_announcements', JSON.stringify(updated))
    return [...updated, ...mockAnnouncements]
  } catch {
    return mockAnnouncements
  }
}

export function getAllLostFound(): LostFoundItem[] {
  try {
    const custom = JSON.parse(localStorage.getItem('campussphere_custom_lostfound') || '[]')
    return [...custom, ...mockLostFound]
  } catch {
    return mockLostFound
  }
}

export function saveCustomLostFound(item: LostFoundItem): LostFoundItem[] {
  try {
    const existing = JSON.parse(localStorage.getItem('campussphere_custom_lostfound') || '[]')
    const updated = [item, ...existing]
    localStorage.setItem('campussphere_custom_lostfound', JSON.stringify(updated))
    return [...updated, ...mockLostFound]
  } catch {
    return mockLostFound
  }
}

export const mockStudents: StudentRecord[] = [
  { id: "s001", full_name: "Aarav Patel", email: "aarav.p@nit.edu", roll_number: "21CS042", department: "Computer Science & Engineering", semester: 5, batch: "2021-25", role: "student", cgpa: 8.7, status: "active", created_at: "2021-08-01T09:00:00Z" },
  { id: "s002", full_name: "Ananya Sen", email: "ananya.s@nit.edu", roll_number: "21CS019", department: "Computer Science & Engineering", semester: 5, batch: "2021-25", role: "club_leader", cgpa: 9.1, status: "active", created_at: "2021-08-01T09:00:00Z" },
  { id: "s003", full_name: "Rohan Gupta", email: "rohan.g@nit.edu", roll_number: "21EC033", department: "Electronics & Communication", semester: 5, batch: "2021-25", role: "student", cgpa: 7.9, status: "active", created_at: "2021-08-01T09:00:00Z" },
  { id: "s004", full_name: "Pooja Nair", email: "pooja.n@nit.edu", roll_number: "22ME011", department: "Mechanical Engineering", semester: 3, batch: "2022-26", role: "student", cgpa: 8.3, status: "active", created_at: "2022-08-01T09:00:00Z" },
  { id: "s005", full_name: "Karan Mehta", email: "karan.m@nit.edu", roll_number: "22CS047", department: "Computer Science & Engineering", semester: 3, batch: "2022-26", role: "student", cgpa: 8.0, status: "active", created_at: "2022-08-01T09:00:00Z" },
  { id: "s006", full_name: "Sneha Iyer", email: "sneha.i@nit.edu", roll_number: "21CE005", department: "Civil Engineering", semester: 5, batch: "2021-25", role: "student", cgpa: 7.5, status: "active", created_at: "2021-08-01T09:00:00Z" },
  { id: "s007", full_name: "Arjun Sharma", email: "arjun.s@nit.edu", roll_number: "23CS008", department: "Computer Science & Engineering", semester: 1, batch: "2023-27", role: "student", cgpa: 9.4, status: "active", created_at: "2023-08-01T09:00:00Z" },
  { id: "s008", full_name: "Divya Reddy", email: "divya.r@nit.edu", roll_number: "21EE022", department: "Electrical Engineering", semester: 5, batch: "2021-25", role: "student", cgpa: 8.6, status: "active", created_at: "2021-08-01T09:00:00Z" },
  { id: "s009", full_name: "Rahul Joshi", email: "rahul.j@nit.edu", roll_number: "22EC044", department: "Electronics & Communication", semester: 3, batch: "2022-26", role: "student", cgpa: 7.2, status: "inactive", created_at: "2022-08-01T09:00:00Z" },
  { id: "s010", full_name: "Priya Krishnan", email: "priya.k@nit.edu", roll_number: "20CS003", department: "Computer Science & Engineering", semester: 7, batch: "2020-24", role: "student", cgpa: 9.2, status: "active", created_at: "2020-08-01T09:00:00Z" },
  { id: "s011", full_name: "Nikhil Bansal", email: "nikhil.b@nit.edu", roll_number: "21IT029", department: "Information Technology", semester: 5, batch: "2021-25", role: "student", cgpa: 8.1, status: "active", created_at: "2021-08-01T09:00:00Z" },
  { id: "s012", full_name: "Meera Pillai", email: "meera.p@nit.edu", roll_number: "22CE016", department: "Civil Engineering", semester: 3, batch: "2022-26", role: "club_leader", cgpa: 8.9, status: "active", created_at: "2022-08-01T09:00:00Z" },
  { id: "s013", full_name: "Aditya Kumar", email: "aditya.k@nit.edu", roll_number: "23ME007", department: "Mechanical Engineering", semester: 1, batch: "2023-27", role: "student", cgpa: 7.8, status: "active", created_at: "2023-08-01T09:00:00Z" },
  { id: "s014", full_name: "Sanjana Verma", email: "sanjana.v@nit.edu", roll_number: "21CS056", department: "Computer Science & Engineering", semester: 5, batch: "2021-25", role: "student", cgpa: 8.4, status: "active", created_at: "2021-08-01T09:00:00Z" },
  { id: "s015", full_name: "Vivek Nair", email: "vivek.n@nit.edu", roll_number: "20EE018", department: "Electrical Engineering", semester: 7, batch: "2020-24", role: "student", cgpa: 7.6, status: "active", created_at: "2020-08-01T09:00:00Z" },
]

export function getAllStudents(): StudentRecord[] {
  try {
    const registered = JSON.parse(localStorage.getItem('campussphere_registered_users') || '[]')
    const registeredStudents: StudentRecord[] = registered
      .filter((u: any) => u.role === 'student' || u.role === 'club_leader' || !u.role)
      .map((u: any, idx: number) => ({
        id: u.id || `reg-${idx}`,
        full_name: u.full_name,
        email: u.email,
        roll_number: `23CS${(900 + idx).toString()}`,
        department: u.department || 'Computer Science & Engineering',
        semester: 1,
        batch: '2023-27',
        role: u.role || 'student',
        cgpa: 8.5,
        status: 'active' as const,
        created_at: u.created_at || new Date().toISOString(),
      }))
    return [...registeredStudents, ...mockStudents]
  } catch {
    return mockStudents
  }
}
