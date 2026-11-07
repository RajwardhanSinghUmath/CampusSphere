from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional
from app.database import supabase, supabase_admin
from app.schemas.lost_found import LostFoundCreate, LostFoundUpdate
from app.routers.auth import get_current_user

router = APIRouter()


def _enrich_with_poster(item: dict) -> dict:
    """Add poster_name from profiles to a lost/found item dict."""
    try:
        user_id = item.get("user_id")
        if user_id:
            profile = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
            item["poster_name"] = profile.data.get("full_name")
    except Exception:
        item["poster_name"] = None
    return item


@router.get("/")
def list_items(
    type: Optional[str] = Query(None, description="Filter by type: lost or found"),
    status: Optional[str] = Query(None, description="Filter by status: open or resolved"),
):
    try:
        query = supabase.table("lost_found_items").select("*").order("created_at", desc=True)
        if type:
            query = query.eq("type", type)
        if status:
            query = query.eq("status", status)
        result = query.execute()
        return [_enrich_with_poster(item) for item in result.data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
def create_item(data: LostFoundCreate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        payload = data.model_dump(exclude_none=True)
        # Convert enum values to strings
        payload["type"] = payload["type"].value if hasattr(payload["type"], "value") else payload["type"]
        payload["user_id"] = user.id
        payload["status"] = "open"
        result = supabase_admin.table("lost_found_items").insert(payload).execute()
        return _enrich_with_poster(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{item_id}")
def get_item(item_id: str):
    try:
        result = supabase.table("lost_found_items").select("*").eq("id", item_id).single().execute()
        return _enrich_with_poster(result.data)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Item not found")


@router.put("/{item_id}")
def update_item(item_id: str, data: LostFoundUpdate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        existing = supabase.table("lost_found_items").select("user_id").eq("id", item_id).single().execute()
        profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        is_admin = profile.data.get("role") == "admin"
        if existing.data["user_id"] != user.id and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to update this item")
        payload = data.model_dump(exclude_none=True)
        if "status" in payload and hasattr(payload["status"], "value"):
            payload["status"] = payload["status"].value
        result = supabase_admin.table("lost_found_items").update(payload).eq("id", item_id).execute()
        return _enrich_with_poster(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{item_id}")
def delete_item(item_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        existing = supabase.table("lost_found_items").select("user_id").eq("id", item_id).single().execute()
        profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        is_admin = profile.data.get("role") == "admin"
        if existing.data["user_id"] != user.id and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to delete this item")
        supabase_admin.table("lost_found_items").delete().eq("id", item_id).execute()
        return {"message": "Item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{item_id}/resolve")
def resolve_item(item_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        existing = supabase.table("lost_found_items").select("user_id").eq("id", item_id).single().execute()
        if existing.data["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Only the owner can mark an item as resolved")
        result = supabase_admin.table("lost_found_items").update({"status": "resolved"}).eq("id", item_id).execute()
        return _enrich_with_poster(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
