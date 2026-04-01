from pydantic import BaseModel
from typing import Optional


class ProgramBase(BaseModel):
    name: str
    faculty: str
    degree_level: str
    duration_years: int
    active: bool = True


class ProgramCreate(ProgramBase):
    pass


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    faculty: Optional[str] = None
    degree_level: Optional[str] = None
    duration_years: Optional[int] = None
    active: Optional[bool] = None


class ProgramResponse(ProgramBase):
    id: int

    class Config:
        from_attributes = True
