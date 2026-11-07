from pydantic import BaseModel
from typing import Optional


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    is_pinned: bool = False


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None


class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    created_by: str
    created_at: str
    is_pinned: bool
    author_name: Optional[str] = None
