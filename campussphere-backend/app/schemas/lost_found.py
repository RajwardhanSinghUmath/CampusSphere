from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ItemType(str, Enum):
    lost = "lost"
    found = "found"


class ItemStatus(str, Enum):
    open = "open"
    resolved = "resolved"


class LostFoundCreate(BaseModel):
    title: str
    description: str
    type: ItemType
    location: str
    image_url: Optional[str] = None
    contact_info: Optional[str] = None


class LostFoundUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[ItemStatus] = None
    contact_info: Optional[str] = None


class LostFoundResponse(BaseModel):
    id: str
    title: str
    description: str
    type: str
    location: str
    image_url: Optional[str] = None
    contact_info: Optional[str] = None
    user_id: str
    status: str
    created_at: str
    poster_name: Optional[str] = None
