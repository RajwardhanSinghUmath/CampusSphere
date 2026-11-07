from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional
from app.database import supabase, supabase_admin
from app.schemas.events import EventCreate, EventUpdate
from app.routers.auth import get_current_user

router = APIRouter()


def _get_attendee_count(event_id: str) -> int:
    """Return the number of RSVPs for a given event."""
    try:
        result = supabase.table("event_rsvps").select("id", count="exact").eq("event_id", event_id).execute()
        return result.count or 0
    except Exception:
        return 0


def _is_user_rsvped(event_id: str, user_id: str) -> bool:
    """Check whether a specific user has RSVPed to an event."""
    try:
        result = supabase.table("event_rsvps").select("id").eq("event_id", event_id).eq("user_id", user_id).execute()
        return len(result.data) > 0
    except Exception:
        return False


@router.get("/")
def list_events(
    club_id: Optional[str] = Query(None),
    upcoming: Optional[bool] = Query(None),
    authorization: Optional[str] = Header(None),
):
    try:
        query = supabase.table("events").select("*").order("date", desc=False)
        if club_id:
            query = query.eq("club_id", club_id)
        if upcoming:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc).isoformat()
            query = query.gte("date", now)
        result = query.execute()

        # Determine current user for is_rsvped check
        current_user_id = None
        if authorization and authorization.startswith("Bearer "):
            try:
                user, _ = get_current_user(authorization)
                current_user_id = user.id
            except Exception:
                pass

        events = []
        for event in result.data:
            event["attendee_count"] = _get_attendee_count(event["id"])
            event["is_rsvped"] = _is_user_rsvped(event["id"], current_user_id) if current_user_id else False
            events.append(event)

        return events
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
def create_event(data: EventCreate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        payload = data.model_dump(exclude_none=True)
        # Serialize datetime to ISO string for Supabase
        if "date" in payload and hasattr(payload["date"], "isoformat"):
            payload["date"] = payload["date"].isoformat()
        payload["created_by"] = user.id
        result = supabase_admin.table("events").insert(payload).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{event_id}")
def get_event(event_id: str, authorization: Optional[str] = Header(None)):
    try:
        result = supabase.table("events").select("*").eq("id", event_id).single().execute()
        event = result.data
        event["attendee_count"] = _get_attendee_count(event_id)
        current_user_id = None
        if authorization and authorization.startswith("Bearer "):
            try:
                user, _ = get_current_user(authorization)
                current_user_id = user.id
            except Exception:
                pass
        event["is_rsvped"] = _is_user_rsvped(event_id, current_user_id) if current_user_id else False
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Event not found")


@router.put("/{event_id}")
def update_event(event_id: str, data: EventUpdate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        # Fetch existing event to check ownership
        existing = supabase.table("events").select("created_by").eq("id", event_id).single().execute()
        profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        is_admin = profile.data.get("role") == "admin"
        if existing.data["created_by"] != user.id and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to update this event")
        payload = data.model_dump(exclude_none=True)
        if "date" in payload and hasattr(payload["date"], "isoformat"):
            payload["date"] = payload["date"].isoformat()
        result = supabase_admin.table("events").update(payload).eq("id", event_id).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{event_id}")
def delete_event(event_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        existing = supabase.table("events").select("created_by").eq("id", event_id).single().execute()
        profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        is_admin = profile.data.get("role") == "admin"
        if existing.data["created_by"] != user.id and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        supabase_admin.table("events").delete().eq("id", event_id).execute()
        return {"message": "Event deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{event_id}/rsvp")
def rsvp_event(event_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        # Check if event exists
        event = supabase.table("events").select("id, max_attendees").eq("id", event_id).single().execute()
        if not event.data:
            raise HTTPException(status_code=404, detail="Event not found")

        # Check max attendees limit
        max_attendees = event.data.get("max_attendees")
        if max_attendees:
            count = _get_attendee_count(event_id)
            if count >= max_attendees:
                raise HTTPException(status_code=400, detail="Event is fully booked")

        supabase_admin.table("event_rsvps").insert({
            "event_id": event_id,
            "user_id": user.id
        }).execute()
        return {"message": "RSVP successful"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{event_id}/rsvp")
def cancel_rsvp(event_id: str, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        supabase_admin.table("event_rsvps").delete().eq("event_id", event_id).eq("user_id", user.id).execute()
        return {"message": "RSVP cancelled successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{event_id}/attendees")
def get_attendees(event_id: str):
    try:
        result = supabase.table("event_rsvps").select("user_id, rsvped_at, profiles(id, full_name, email, avatar_url)").eq("event_id", event_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
