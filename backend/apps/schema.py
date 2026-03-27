from typing import Optional

from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_image: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str


class TicketUpdateStatus(BaseModel):
    status: str


class TicketUpdatePriority(BaseModel):
    priority: str


class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None

class TicketAssign(BaseModel):
    assigned_to: Optional[int] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    profile_image: Optional[str] = None
    class Config:
        from_attributes = True

class TicketOut(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    status: str
    created_at: datetime
    assigned_to: int | None
    assigned_user: UserOut | None   # 🔥 THIS LINE

    class Config:
        from_attributes = True