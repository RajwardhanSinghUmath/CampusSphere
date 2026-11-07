from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.database import supabase, supabase_admin
from app.schemas.auth import RegisterRequest, LoginRequest, ProfileUpdate, UserProfile

router = APIRouter()


def get_current_user(authorization: Optional[str] = None):
    """Extract and verify the JWT token from the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user, token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register")
def register(data: RegisterRequest):
    try:
        auth_response = supabase_admin.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True
        })
        user_id = auth_response.user.id
        supabase_admin.table("profiles").insert({
            "id": user_id,
            "email": data.email,
            "full_name": data.full_name,
            "role": data.role
        }).execute()
        return {"message": "Registration successful", "user_id": user_id}
    except Exception as e:
        err_str = str(e)
        if "already registered" in err_str.lower() or "already exists" in err_str.lower():
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")
        if "timed out" in err_str.lower() or "timeout" in err_str.lower():
            raise HTTPException(status_code=504, detail="Connection to database timed out. Please check your network or try again.")
        raise HTTPException(status_code=400, detail=err_str)


@router.post("/login")
def login(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        user = response.user
        session = response.session
        profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        return {
            "access_token": session.access_token,
            "token_type": "bearer",
            "user": profile.data
        }
    except Exception as e:
        err_str = str(e)
        if "invalid login credentials" in err_str.lower() or "invalid_credentials" in err_str.lower():
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        if "timed out" in err_str.lower() or "timeout" in err_str.lower():
            raise HTTPException(status_code=504, detail="Connection to database timed out. Please try again.")
        raise HTTPException(status_code=400, detail=err_str)


@router.get("/profile")
def get_profile(authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        return profile.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/profile")
def update_profile(data: ProfileUpdate, authorization: Optional[str] = Header(None)):
    user, token = get_current_user(authorization)
    try:
        update_data = data.model_dump(exclude_none=True)
        supabase.table("profiles").update(update_data).eq("id", user.id).execute()
        profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        return profile.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
