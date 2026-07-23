from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field


# ---------- Auth / Users ----------

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = Field(pattern="^(librarian|member)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    registered_at: datetime
    expiry_date: Optional[datetime] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Books ----------

class BookOut(BaseModel):
    id: int
    title: str
    author: str
    description: Optional[str] = None
    original_filename: str
    created_at: datetime
    uploaded_by: UserOut

    model_config = ConfigDict(from_attributes=True)