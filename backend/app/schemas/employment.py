from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class EmploymentBase(BaseModel):
    is_employed: bool
    company_name: Optional[str] = None
    company_sector: Optional[str] = None
    job_title: Optional[str] = None
    is_career_related: Optional[bool] = None
    employment_type: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = "Perú"
    salary_range: Optional[str] = None
    start_date: Optional[date] = None
    is_current: bool = True


class EmploymentCreate(EmploymentBase):
    graduate_id: int


class EmploymentUpdate(BaseModel):
    is_employed: Optional[bool] = None
    company_name: Optional[str] = None
    company_sector: Optional[str] = None
    job_title: Optional[str] = None
    is_career_related: Optional[bool] = None
    employment_type: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None
    salary_range: Optional[str] = None
    start_date: Optional[date] = None
    is_current: Optional[bool] = None


class EmploymentResponse(EmploymentBase):
    id: int
    graduate_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True
