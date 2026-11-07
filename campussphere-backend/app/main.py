from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, events, clubs, announcements, lost_found, resources

app = FastAPI(title="CampusSphere API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "https://*.vercel.app"],
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

@app.get("/")
def root():
    return {"message": "CampusSphere API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
