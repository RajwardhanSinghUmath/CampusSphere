from pydantic import BaseModel
from typing import Optional


class ClubCreate(BaseModel):
    name: str
    description: str
    logo_url: Optional[str] = None


class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None


class ClubResponse(BaseModel):
    id: str
    name: str
    description: str
    logo_url: Optional[str] = None
    created_by: str
    created_at: str
    member_count: Optional[int] = 0
    is_member: Optional[bool] = False
