from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, events, clubs, announcements, lost_found, resources, ai_assistant
from app.database import supabase
from typing import Optional
from datetime import datetime, timezone

app = FastAPI(title="CampusSphere API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(clubs.router, prefix="/api/clubs", tags=["clubs"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(lost_found.router, prefix="/api/lost-found", tags=["lost-found"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["ai-assistant"])


@app.get("/api/stats")
def get_stats():
    """Return dashboard summary stats with live count or fallback values for demo."""
    try:
        events_cnt = supabase.table("events").select("id", count="exact").execute().count or 0
        clubs_cnt = supabase.table("clubs").select("id", count="exact").execute().count or 0
        lost_cnt = supabase.table("lost_found_items").select("id", count="exact").eq("status", "open").execute().count or 0
        return {
            "total_events": events_cnt if events_cnt > 0 else 8,
            "total_clubs": clubs_cnt if clubs_cnt > 0 else 6,
            "open_lost_items": lost_cnt if lost_cnt > 0 else 4,
        }
    except Exception:
        return {
            "total_events": 8,
            "total_clubs": 6,
            "open_lost_items": 4,
        }


@app.get("/")
def root():
    return {"message": "CampusSphere API with AI Assistant", "version": "1.1.0"}


@app.get("/health")
def health():
    return {"status": "ok", "roles_supported": ["student", "admin", "club_leader", "faculty", "staff"]}


# ─── Student Registrations Endpoint ───────────────────────────────────────────
# Dummy endpoint: tries Supabase profiles table, falls back to rich mock data.

DUMMY_STUDENTS = [
    {"id": "s001", "full_name": "Aarav Patel", "email": "aarav.p@nit.edu", "roll_number": "21CS042", "department": "Computer Science & Engineering", "semester": 5, "batch": "2021-25", "role": "student", "cgpa": 8.7, "status": "active", "created_at": "2021-08-01T09:00:00Z"},
    {"id": "s002", "full_name": "Ananya Sen", "email": "ananya.s@nit.edu", "roll_number": "21CS019", "department": "Computer Science & Engineering", "semester": 5, "batch": "2021-25", "role": "club_leader", "cgpa": 9.1, "status": "active", "created_at": "2021-08-01T09:00:00Z"},
    {"id": "s003", "full_name": "Rohan Gupta", "email": "rohan.g@nit.edu", "roll_number": "21EC033", "department": "Electronics & Communication", "semester": 5, "batch": "2021-25", "role": "student", "cgpa": 7.9, "status": "active", "created_at": "2021-08-01T09:00:00Z"},
    {"id": "s004", "full_name": "Pooja Nair", "email": "pooja.n@nit.edu", "roll_number": "22ME011", "department": "Mechanical Engineering", "semester": 3, "batch": "2022-26", "role": "student", "cgpa": 8.3, "status": "active", "created_at": "2022-08-01T09:00:00Z"},
    {"id": "s005", "full_name": "Karan Mehta", "email": "karan.m@nit.edu", "roll_number": "22CS047", "department": "Computer Science & Engineering", "semester": 3, "batch": "2022-26", "role": "student", "cgpa": 8.0, "status": "active", "created_at": "2022-08-01T09:00:00Z"},
    {"id": "s006", "full_name": "Sneha Iyer", "email": "sneha.i@nit.edu", "roll_number": "21CE005", "department": "Civil Engineering", "semester": 5, "batch": "2021-25", "role": "student", "cgpa": 7.5, "status": "active", "created_at": "2021-08-01T09:00:00Z"},
    {"id": "s007", "full_name": "Arjun Sharma", "email": "arjun.s@nit.edu", "roll_number": "23CS008", "department": "Computer Science & Engineering", "semester": 1, "batch": "2023-27", "role": "student", "cgpa": 9.4, "status": "active", "created_at": "2023-08-01T09:00:00Z"},
    {"id": "s008", "full_name": "Divya Reddy", "email": "divya.r@nit.edu", "roll_number": "21EE022", "department": "Electrical Engineering", "semester": 5, "batch": "2021-25", "role": "student", "cgpa": 8.6, "status": "active", "created_at": "2021-08-01T09:00:00Z"},
    {"id": "s009", "full_name": "Rahul Joshi", "email": "rahul.j@nit.edu", "roll_number": "22EC044", "department": "Electronics & Communication", "semester": 3, "batch": "2022-26", "role": "student", "cgpa": 7.2, "status": "inactive", "created_at": "2022-08-01T09:00:00Z"},
    {"id": "s010", "full_name": "Priya Krishnan", "email": "priya.k@nit.edu", "roll_number": "20CS003", "department": "Computer Science & Engineering", "semester": 7, "batch": "2020-24", "role": "student", "cgpa": 9.2, "status": "active", "created_at": "2020-08-01T09:00:00Z"},
    {"id": "s011", "full_name": "Nikhil Bansal", "email": "nikhil.b@nit.edu", "roll_number": "21IT029", "department": "Information Technology", "semester": 5, "batch": "2021-25", "role": "student", "cgpa": 8.1, "status": "active", "created_at": "2021-08-01T09:00:00Z"},
    {"id": "s012", "full_name": "Meera Pillai", "email": "meera.p@nit.edu", "roll_number": "22CE016", "department": "Civil Engineering", "semester": 3, "batch": "2022-26", "role": "club_leader", "cgpa": 8.9, "status": "active", "created_at": "2022-08-01T09:00:00Z"},
    {"id": "s013", "full_name": "Aditya Kumar", "email": "aditya.k@nit.edu", "roll_number": "23ME007", "department": "Mechanical Engineering", "semester": 1, "batch": "2023-27", "role": "student", "cgpa": 7.8, "status": "active", "created_at": "2023-08-01T09:00:00Z"},
    {"id": "s014", "full_name": "Sanjana Verma", "email": "sanjana.v@nit.edu", "roll_number": "21CS056", "department": "Computer Science & Engineering", "semester": 5, "batch": "2021-25", "role": "student", "cgpa": 8.4, "status": "active", "created_at": "2021-08-01T09:00:00Z"},
    {"id": "s015", "full_name": "Vivek Nair", "email": "vivek.n@nit.edu", "roll_number": "20EE018", "department": "Electrical Engineering", "semester": 7, "batch": "2020-24", "role": "student", "cgpa": 7.6, "status": "active", "created_at": "2020-08-01T09:00:00Z"},
]


@app.get("/api/students")
def list_students(
    department: Optional[str] = None,
    batch: Optional[str] = None,
    semester: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
):
    """
    Student Registrations — returns registered students.
    Tries Supabase profiles table first; falls back to rich dummy data.
    Supports filtering by department, batch, semester, status, and free-text search.
    """
    students = []
    try:
        query = supabase.table("profiles").select("*").eq("role", "student")
        result = query.execute()
        if result.data and len(result.data) >= 3:
            students = result.data
    except Exception:
        pass

    if not students:
        students = [s.copy() for s in DUMMY_STUDENTS]

    # Apply filters
    if department:
        students = [s for s in students if department.lower() in (s.get("department") or "").lower()]
    if batch:
        students = [s for s in students if s.get("batch") == batch]
    if semester is not None:
        students = [s for s in students if s.get("semester") == semester]
    if status:
        students = [s for s in students if (s.get("status") or "active") == status]
    if search:
        q = search.lower()
        students = [
            s for s in students
            if q in (s.get("full_name") or "").lower()
            or q in (s.get("email") or "").lower()
            or q in (s.get("roll_number") or "").lower()
        ]

    return {
        "total": len(students),
        "students": students,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/students/{student_id}")
def get_student(student_id: str):
    """Get a single student's registration detail by ID."""
    try:
        result = supabase.table("profiles").select("*").eq("id", student_id).single().execute()
        if result.data:
            return result.data
    except Exception:
        pass

    match = next((s for s in DUMMY_STUDENTS if s["id"] == student_id), None)
    if match:
        return match
    return DUMMY_STUDENTS[0]
