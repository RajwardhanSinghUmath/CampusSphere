from pydantic import BaseModel
from typing import Optional


class ResourceCreate(BaseModel):
    title: str
    description: str
    url: str
    file_type: Optional[str] = None  # pdf, link, video, etc.
    subject: Optional[str] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    file_type: Optional[str] = None
    subject: Optional[str] = None


class ResourceResponse(BaseModel):
    id: str
    title: str
    description: str
    url: str
    file_type: Optional[str] = None
    subject: Optional[str] = None
    uploaded_by: str
    created_at: str
    uploader_name: Optional[str] = None
