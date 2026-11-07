from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    club_id: Optional[str] = None
    max_attendees: Optional[int] = None
    image_url: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    max_attendees: Optional[int] = None
    image_url: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: str
    location: str
    club_id: Optional[str] = None
    created_by: str
    max_attendees: Optional[int] = None
    image_url: Optional[str] = None
    created_at: str
    attendee_count: Optional[int] = 0
    is_rsvped: Optional[bool] = False
