from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class MemberCreate(BaseModel):
    name: str
    email: EmailStr


class MemberOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    registered_at: datetime
    expiry_date: datetime
    is_active: bool

    # lets Pydantic read data straight off the SQLAlchemy model
    model_config = ConfigDict(from_attributes=True)
