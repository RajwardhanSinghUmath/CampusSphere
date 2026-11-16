from pydantic import BaseModel, EmailStr
from typing import Optional, Literal, List
from datetime import datetime

UserRole = Literal["student", "admin", "club_leader", "faculty", "staff"]

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = "student"
    department: Optional[str] = None
    interests: Optional[List[str]] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    interests: Optional[List[str]] = None


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    interests: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
