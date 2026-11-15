from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, events, clubs, announcements, lost_found, resources, ai_assistant
from app.database import supabase

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
