from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.database import supabase, supabase_admin
from app.schemas.clubs import ClubCreate, ClubUpdate
from app.routers.auth import get_current_user

router = APIRouter()


def _get_member_count(club_id: str) -> int:
    try:
        result = supabase.table("club_memberships").select("id", count="exact").eq("club_id", club_id).execute()
        return result.count or 0
    except Exception:
        return 0


def _is_member(club_id: str, user_id: str) -> bool:
    try:
        result = supabase.table("club_memberships").select("id").eq("club_id", club_id).eq("user_id", user_id).execute()
        return len(result.data) > 0
    except Exception:
        return False


def _require_admin(user_id: str):
    profile = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
    if profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/")
def list_clubs(authorization: Optional[str] = Header(None)):
    try:
        result = supabase.table("clubs").select("*").order("created_at", desc=True).execute()
        current_user_id = None
        if authorization and authorization.startswith("Bearer "):
            try:
                user, _ = get_current_user(authorization)
                current_user_id = user.id
            except Exception:
                pass

        clubs = []
        for club in result.data:
            club["member_count"] = _get_member_count(club["id"])
            club["is_member"] = _is_member(club["id"], current_user_id) if current_user_id else False
            clubs.append(club)
        return clubs
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
def create_club(data: ClubCreate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    _require_admin(user.id)
    try:
        payload = data.model_dump(exclude_none=True)
        payload["created_by"] = user.id
        result = supabase_admin.table("clubs").insert(payload).execute()
        club = result.data[0]
        club["member_count"] = 0
        club["is_member"] = False
        return club
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{club_id}")
def get_club(club_id: str, authorization: Optional[str] = Header(None)):
    try:
        result = supabase.table("clubs").select("*").eq("id", club_id).single().execute()
        club = result.data
        club["member_count"] = _get_member_count(club_id)
        current_user_id = None
        if authorization and authorization.startswith("Bearer "):
            try:
                user, _ = get_current_user(authorization)
                current_user_id = user.id
            except Exception:
                pass
        club["is_member"] = _is_member(club_id, current_user_id) if current_user_id else False
        return club
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Club not found")


@router.put("/{club_id}")
def update_club(club_id: str, data: ClubUpdate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        existing = supabase.table("clubs").select("created_by").eq("id", club_id).single().execute()
        profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        is_admin = profile.data.get("role") == "admin"
        if existing.data["created_by"] != user.id and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to update this club")
        payload = data.model_dump(exclude_none=True)
        result = supabase_admin.table("clubs").update(payload).eq("id", club_id).execute()
        club = result.data[0]
        club["member_count"] = _get_member_count(club_id)
        club["is_member"] = _is_member(club_id, user.id)
        return club
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{club_id}")
def delete_club(club_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    _require_admin(user.id)
    try:
        supabase_admin.table("clubs").delete().eq("id", club_id).execute()
        return {"message": "Club deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{club_id}/join")
def join_club(club_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        # Check club exists
        supabase.table("clubs").select("id").eq("id", club_id).single().execute()
        supabase_admin.table("club_memberships").insert({
            "club_id": club_id,
            "user_id": user.id,
            "role": "member"
        }).execute()
        return {"message": "Joined club successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{club_id}/leave")
def leave_club(club_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        supabase_admin.table("club_memberships").delete().eq("club_id", club_id).eq("user_id", user.id).execute()
        return {"message": "Left club successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{club_id}/members")
def get_members(club_id: str):
    try:
        result = supabase.table("club_memberships").select(
            "user_id, role, joined_at, profiles(id, full_name, email, avatar_url)"
        ).eq("club_id", club_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
