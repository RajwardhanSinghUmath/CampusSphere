#!/usr/bin/env python3
"""
CampusSphere Comprehensive Demo Data Seeder
Populates Supabase with complete dummy data for all 5 roles and all campus modules.
Run:
    python seed_data.py
"""
import os
import sys
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "") or os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ ERROR: Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env")
    sys.exit(1)

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
print(f"✅ Connected to Supabase: {SUPABASE_URL}")

now = datetime.now(timezone.utc)

# 1. CAMPUS USERS (5 distinct roles)
demo_users = [
    {"email": "admin@nit.edu", "password": "campus1234", "full_name": "Dr. Rajesh Sharma (Dean)", "role": "admin"},
    {"email": "student@nit.edu", "password": "campus1234", "full_name": "Aarav Patel (Student)", "role": "student"},
    {"email": "club@nit.edu", "password": "campus1234", "full_name": "Ananya Sen (Coding Club Lead)", "role": "club_leader"},
    {"email": "faculty@nit.edu", "password": "campus1234", "full_name": "Prof. Vikram Malhotra (CSE)", "role": "faculty"},
    {"email": "staff@nit.edu", "password": "campus1234", "full_name": "Sunita Verma (Student Affairs)", "role": "staff"},
    {"email": "student2@nit.edu", "password": "campus1234", "full_name": "Rohan Gupta (ECE)", "role": "student"},
]

user_ids = {}
print("\n👤 Seeding demo users...")
for u in demo_users:
    try:
        # Check if user already exists
        existing = sb.table("profiles").select("id").eq("email", u["email"]).execute()
        if existing.data and len(existing.data) > 0:
            uid = existing.data[0]["id"]
            user_ids[u["role"]] = uid
            sb.table("profiles").update({"role": u["role"], "full_name": u["full_name"]}).eq("id", uid).execute()
            print(f"  ♻️ Updated existing: {u['full_name']} [{u['role']}]")
            continue

        resp = sb.auth.admin.create_user({
            "email": u["email"],
            "password": u["password"],
            "email_confirm": True,
        })
        uid = resp.user.id
        user_ids[u["role"]] = uid
        sb.table("profiles").upsert({
            "id": uid,
            "email": u["email"],
            "full_name": u["full_name"],
            "role": u["role"],
        }).execute()
        print(f"  ✅ Created user: {u['full_name']} [{u['role']}]")
    except Exception as e:
        print(f"  ⚠️ Note for {u['email']}: {e}")
        try:
            p = sb.table("profiles").select("id").eq("email", u["email"]).single().execute()
            user_ids[u["role"]] = p.data["id"]
        except Exception:
            pass

admin_id = user_ids.get("admin")
student_id = user_ids.get("student")
club_lead_id = user_ids.get("club_leader") or admin_id
faculty_id = user_ids.get("faculty") or admin_id
staff_id = user_ids.get("staff") or admin_id

# 2. CLUBS
print("\n🎪 Seeding clubs...")
clubs_data = [
    {"name": "NIT Coding Club", "description": "Campus hub for competitive programming, Web3, full-stack development, and hackathons.", "created_by": club_lead_id},
    {"name": "Robotics & Automation Society", "description": "Hands-on robotics, drone design, autonomous rovers, and IoT competitions.", "created_by": club_lead_id},
    {"name": "E-Cell (Entrepreneurship Cell)", "description": "Incubating student startups, connecting with VCs, and hosting business plan competitions.", "created_by": faculty_id},
    {"name": "Photography & Film Club", "description": "Visual storytelling, photo walks across campus, and cinematic campus media production.", "created_by": student_id},
    {"name": "Literary & Debating Society", "description": "Parliamentary debates, MUN simulations, creative writing slams, and annual literary fest.", "created_by": student_id},
    {"name": "Green Campus Initiative", "description": "Promoting zero-waste campus, tree plantation drives, and solar power awareness.", "created_by": staff_id},
]

club_ids = []
for cl in clubs_data:
    try:
        res = sb.table("clubs").insert(cl).execute()
        if res.data:
            club_ids.append(res.data[0]["id"])
            print(f"  ✅ Club: {cl['name']}")
    except Exception as e:
        print(f"  ⚠️ Club error ({cl['name']}): {e}")

# 3. EVENTS
print("\n📅 Seeding events...")
events_data = [
    {
        "title": "NIT National Hackathon 2026",
        "description": "36-hour flagship hackathon. Over ₹1,50,000 in cash prizes, internships with top tech companies, and cloud sponsor credits. Food & swags provided!",
        "date": (now + timedelta(days=5)).isoformat(),
        "location": "Central Computing Center, Main Block",
        "max_attendees": 150,
        "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        "created_by": club_lead_id,
        "club_id": club_ids[0] if club_ids else None,
    },
    {
        "title": "Freshers' Orientation & Cultural Night",
        "description": "Grand welcome gala for Semester 1 students! Club showcase, musical performances by campus bands, games, and complimentary dinner buffet.",
        "date": (now + timedelta(days=2)).isoformat(),
        "location": "Open Air Amphitheatre",
        "max_attendees": 350,
        "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        "created_by": admin_id,
    },
    {
        "title": "Industry Workshop: Generative AI & LLM Systems",
        "description": "Special hands-on workshop by NIT Alumni working at Google DeepMind and Groq. Learn fine-tuning, RAG architecture, and API deployment.",
        "date": (now + timedelta(days=8)).isoformat(),
        "location": "Seminar Hall 1, CSE Dept",
        "max_attendees": 100,
        "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
        "created_by": faculty_id,
        "club_id": club_ids[0] if club_ids else None,
    },
    {
        "title": "Campus Sunset Photo Walk & Drone Showcase",
        "description": "Bring your DSLR or smartphone! Guided session on golden-hour photography and live FPV drone videography demo.",
        "date": (now + timedelta(days=4)).isoformat(),
        "location": "Sports Complex Pavilion",
        "max_attendees": 40,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
        "created_by": student_id,
        "club_id": club_ids[3] if len(club_ids) > 3 else None,
    },
    {
        "title": "Startup Pitch Fest & Angel Investor Mixer",
        "description": "10 student teams pitch their ventures to angel investors. Cash grants up to ₹5,00,000 for top three prototypes.",
        "date": (now + timedelta(days=12)).isoformat(),
        "location": "Incubation Center Boardroom",
        "max_attendees": 80,
        "image_url": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
        "created_by": faculty_id,
        "club_id": club_ids[2] if len(club_ids) > 2 else None,
    },
    {
        "title": "Annual Inter-Hostel Cricket Tournament",
        "description": "12-over tennis ball cricket tournament between all 8 campus hostels. Trophies, medals, and refreshments sponsored by Gymkhana.",
        "date": (now + timedelta(days=6)).isoformat(),
        "location": "Main University Oval Ground",
        "max_attendees": 200,
        "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
        "created_by": staff_id,
    },
]

for ev in events_data:
    try:
        res = sb.table("events").insert(ev).execute()
        if res.data:
            print(f"  ✅ Event: {ev['title']}")
    except Exception as e:
        print(f"  ⚠️ Event error ({ev['title']}): {e}")

# 4. ANNOUNCEMENTS
print("\n📢 Seeding announcements...")
announcements_data = [
    {
        "title": "Mid-Semester Examination Schedule (Sem 5) Released",
        "content": "The official timetable for Mid-Semester Examinations has been published by the Academic Section. Exams will run from Dec 1 to Dec 9, 2026. Hall tickets are mandatory. Quiet study spaces in the library will operate 24/7.",
        "is_pinned": True,
        "created_by": admin_id,
    },
    {
        "title": "Campus High-Speed Wi-Fi 6 Upgrade Notice",
        "content": "Network Services has upgraded all academic blocks and hostel corridors with Wi-Fi 6 access points. Login using your student LDAP credentials. Report any dead zones via the student portal.",
        "is_pinned": True,
        "created_by": staff_id,
    },
    {
        "title": "Call for Research Internships — AI & Robotics Lab",
        "content": "Prof. Vikram Malhotra is inviting applications from 3rd and 4th year students for funded winter research projects on Computer Vision and Edge Robotics. Submit your resume by Nov 25th.",
        "is_pinned": False,
        "created_by": faculty_id,
    },
    {
        "title": "NIT Coding Club Wins 1st Prize at National Inter-NIT Hackathon",
        "content": "Congratulations to Team 'CampusSphere' for securing the championship trophy and ₹1 Lakh prize at the All-India Inter-NIT Tech Meet! Proud moment for the entire campus.",
        "is_pinned": False,
        "created_by": club_lead_id,
    },
]

for an in announcements_data:
    try:
        sb.table("announcements").insert(an).execute()
        print(f"  ✅ Announcement: {an['title']}")
    except Exception as e:
        print(f"  ⚠️ Announcement error: {e}")

# 5. LOST & FOUND
print("\n🔍 Seeding lost & found...")
lf_items = [
    {
        "title": "Lost: Casio FX-991CW Calculator with Black Cover",
        "description": "Left in Lecture Hall 3 after the Engineering Mathematics class. Has a blue sticker on the back with roll no 21CS042.",
        "type": "lost",
        "location": "Lecture Hall 3, Academic Block A",
        "contact_info": "aarav.p@campussphere.demo | +91 98765 43210",
        "user_id": student_id,
        "status": "open",
    },
    {
        "title": "Found: Black Sony WH-1000XM4 Headphones",
        "description": "Found on the 2nd floor silent reading room table in the Central Library. Kept safe with the library reception desk.",
        "type": "found",
        "location": "Central Library 2nd Floor",
        "contact_info": "Library Desk: library@campussphere.demo",
        "user_id": staff_id,
        "status": "open",
    },
    {
        "title": "Lost: Set of 3 Hostel Keys on a Red Carabiner",
        "description": "Lost between Hostel 4 mess and the football ground. One key has a brass tag 'H4-208'.",
        "type": "lost",
        "location": "Hostel 4 pathway",
        "contact_info": "rohan.g@campussphere.demo",
        "user_id": student_id,
        "status": "open",
    },
    {
        "title": "Found: Fastrack Metal Watch near Basketball Court",
        "description": "Silver dial with dark leather strap. Handed over to the campus security office at Gate 2.",
        "type": "found",
        "location": "Basketball Court",
        "contact_info": "Security Guard Office Gate 2",
        "user_id": staff_id,
        "status": "resolved",
    },
]

for lf in lf_items:
    try:
        sb.table("lost_found_items").insert(lf).execute()
        print(f"  ✅ Lost & Found: {lf['title']}")
    except Exception as e:
        print(f"  ⚠️ Lost & Found error: {e}")

# 6. RESOURCES
print("\n📚 Seeding academic resources...")
resources_data = [
    {
        "title": "Software Engineering Lab Complete Manual & UML Diagrams",
        "description": "Comprehensive lab manual with Class diagrams, Sequence diagrams, Use Case specifications, and Design Patterns.",
        "url": "https://campussphere.internal/docs/se-lab-manual.pdf",
        "file_type": "pdf",
        "subject": "Software Engineering",
        "uploaded_by": faculty_id,
    },
    {
        "title": "Machine Learning & Neural Networks Mid-Sem Question Bank",
        "description": "Previous 5 years question papers with detailed step-by-step mathematical solutions and model architectures.",
        "url": "https://campussphere.internal/docs/ml-question-bank.pdf",
        "file_type": "pdf",
        "subject": "Machine Learning",
        "uploaded_by": faculty_id,
    },
    {
        "title": "Data Structures & Algorithms Handwritten Cheat Sheets",
        "description": "Color-coded visual cheat sheets covering Trees, Graphs, Dynamic Programming, and Amortized Time Complexity.",
        "url": "https://campussphere.internal/docs/dsa-cheatsheet.pdf",
        "file_type": "pdf",
        "subject": "Computer Science",
        "uploaded_by": club_lead_id,
    },
    {
        "title": "Database Management Systems (SQL & Normalization) Slides",
        "description": "Official lecture presentations covering BCNF, 3NF, Transactions, ACID properties, and PostgreSQL indexing.",
        "url": "https://campussphere.internal/docs/dbms-slides.pdf",
        "file_type": "pdf",
        "subject": "Database Systems",
        "uploaded_by": student_id,
    },
]

for r in resources_data:
    try:
        sb.table("resources").insert(r).execute()
        print(f"  ✅ Resource: {r['title']}")
    except Exception as e:
        print(f"  ⚠️ Resource error: {e}")

print("\n" + "="*60)
print("🎉 DUMMY DATA SEEDING COMPLETE FOR DEMO!")
print("="*60)
print("🔑 Demo Accounts (Password for all: demo1234):")
for u in demo_users:
    print(f"   • {u['role'].upper():12} -> {u['email']}")
print("="*60)
