from pydantic import BaseModel, EmailStr
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from app.schemas.program import ProgramResponse


class GraduateBase(BaseModel):
    first_name: str
    last_name: str
    document_number: str
    email: EmailStr
    phone: Optional[str] = None
    program_id: int
    graduation_year: int
    enrollment_year: Optional[int] = None
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class GraduateCreate(GraduateBase):
    pass


class GraduateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    document_number: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    program_id: Optional[int] = None
    graduation_year: Optional[int] = None
    enrollment_year: Optional[int] = None
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class GraduateResponse(GraduateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GraduateWithProgram(GraduateResponse):
    program: ProgramResponse
