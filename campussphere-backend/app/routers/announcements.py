from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.database import supabase, supabase_admin
from app.schemas.announcements import AnnouncementCreate, AnnouncementUpdate
from app.routers.auth import get_current_user

router = APIRouter()


def _require_admin(user_id: str):
    profile = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
    if profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


def _enrich_with_author(announcement: dict) -> dict:
    """Add author_name from profiles to an announcement dict."""
    try:
        created_by = announcement.get("created_by")
        if created_by:
            profile = supabase.table("profiles").select("full_name").eq("id", created_by).single().execute()
            announcement["author_name"] = profile.data.get("full_name")
    except Exception:
        announcement["author_name"] = None
    return announcement


@router.get("/")
def list_announcements():
    try:
        result = supabase.table("announcements").select("*").order("is_pinned", desc=True).order("created_at", desc=True).execute()
        return [_enrich_with_author(a) for a in result.data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
def create_announcement(data: AnnouncementCreate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    _require_admin(user.id)
    try:
        payload = data.model_dump()
        payload["created_by"] = user.id
        result = supabase_admin.table("announcements").insert(payload).execute()
        announcement = result.data[0]
        return _enrich_with_author(announcement)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{announcement_id}")
def get_announcement(announcement_id: str):
    try:
        result = supabase.table("announcements").select("*").eq("id", announcement_id).single().execute()
        return _enrich_with_author(result.data)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Announcement not found")


@router.put("/{announcement_id}")
def update_announcement(announcement_id: str, data: AnnouncementUpdate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    _require_admin(user.id)
    try:
        payload = data.model_dump(exclude_none=True)
        result = supabase_admin.table("announcements").update(payload).eq("id", announcement_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return _enrich_with_author(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    _require_admin(user.id)
    try:
        supabase_admin.table("announcements").delete().eq("id", announcement_id).execute()
        return {"message": "Announcement deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
