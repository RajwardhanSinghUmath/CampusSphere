from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional
from app.database import supabase, supabase_admin
from app.schemas.resources import ResourceCreate, ResourceUpdate
from app.routers.auth import get_current_user

router = APIRouter()


def _enrich_with_uploader(resource: dict) -> dict:
    """Add uploader_name from profiles to a resource dict."""
    try:
        uploaded_by = resource.get("uploaded_by")
        if uploaded_by:
            profile = supabase.table("profiles").select("full_name").eq("id", uploaded_by).single().execute()
            resource["uploader_name"] = profile.data.get("full_name")
    except Exception:
        resource["uploader_name"] = None
    return resource


@router.get("/subjects")
def get_subjects():
    """Return a list of unique subjects from all resources."""
    try:
        result = supabase.table("resources").select("subject").execute()
        subjects = list({r["subject"] for r in result.data if r.get("subject")})
        subjects.sort()
        return subjects
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
def list_resources(subject: Optional[str] = Query(None, description="Filter by subject")):
    try:
        query = supabase.table("resources").select("*").order("created_at", desc=True)
        if subject:
            query = query.eq("subject", subject)
        result = query.execute()
        return [_enrich_with_uploader(r) for r in result.data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
def create_resource(data: ResourceCreate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        payload = data.model_dump(exclude_none=True)
        payload["uploaded_by"] = user.id
        result = supabase_admin.table("resources").insert(payload).execute()
        return _enrich_with_uploader(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{resource_id}")
def get_resource(resource_id: str):
    try:
        result = supabase.table("resources").select("*").eq("id", resource_id).single().execute()
        return _enrich_with_uploader(result.data)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Resource not found")


@router.put("/{resource_id}")
def update_resource(resource_id: str, data: ResourceUpdate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        existing = supabase.table("resources").select("uploaded_by").eq("id", resource_id).single().execute()
        profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        is_admin = profile.data.get("role") == "admin"
        if existing.data["uploaded_by"] != user.id and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to update this resource")
        payload = data.model_dump(exclude_none=True)
        result = supabase_admin.table("resources").update(payload).eq("id", resource_id).execute()
        return _enrich_with_uploader(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{resource_id}")
def delete_resource(resource_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        existing = supabase.table("resources").select("uploaded_by").eq("id", resource_id).single().execute()
        profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        is_admin = profile.data.get("role") == "admin"
        if existing.data["uploaded_by"] != user.id and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to delete this resource")
        supabase_admin.table("resources").delete().eq("id", resource_id).execute()
        return {"message": "Resource deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
